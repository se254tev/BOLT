const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const workspaceRoot = path.resolve(__dirname, '..', '..');
const reportLines = [];

function log(line) {
  console.log(line);
  reportLines.push(line);
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
}

function findFiles(dir, name) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      results.push(...findFiles(full, name));
    } else if (e.isFile() && e.name === name) {
      results.push(full);
    }
  }
  return results;
}

function findAllPackageJsons() {
  return findFiles(workspaceRoot, 'package.json');
}

function searchUsage(pkgName) {
  const exts = ['.js', '.jsx', '.ts', '.tsx'];
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (full.includes('node_modules') || full.includes('.git')) continue;
        walk(full);
      } else if (e.isFile()) {
        if (!exts.includes(path.extname(e.name))) continue;
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(`require('${pkgName}')`) || content.includes(`require("${pkgName}")`) || content.includes(`from '${pkgName}'`) || content.includes(`from "${pkgName}"`) || content.includes(`require('${pkgName}/`) || content.includes(`from '${pkgName}/`)) {
          results.push(full);
        }
      }
    }
  }
  try { walk(workspaceRoot); } catch (err) {}
  return results;
}

function checkVersionExists(name, versionRange) {
  try {
    // Try npm view for the given range
    const cmd = `npm view ${name}@"${versionRange}" version`;
    const out = execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 20000 }).toString().trim();
    return { ok: true, resolved: out };
  } catch (err) {
    try {
      // fallback: get latest
      const out = execSync(`npm view ${name} version`, { stdio: ['pipe', 'pipe', 'ignore'], timeout: 20000 }).toString().trim();
      return { ok: false, resolved: out };
    } catch (e) {
      return { ok: false, resolved: null };
    }
  }
}

function inspectPackageJson(file) {
  const pj = readJSON(file);
  if (!pj) return null;
  const deps = Object.assign({}, pj.dependencies || {}, pj.devDependencies || {});
  const results = [];
  for (const [name, ver] of Object.entries(deps)) {
    const usage = searchUsage(name);
    const exists = checkVersionExists(name, ver);
    results.push({ name, requested: ver, exists, usage });
  }
  return { file, name: pj.name || path.dirname(file), results, startScript: pj.scripts && pj.scripts.start, main: pj.main };
}

async function main() {
  log('=== DEPLOYMENT AUDIT REPORT ===');
  log(`Workspace root: ${workspaceRoot}`);

  const pkgFiles = findAllPackageJsons();
  log(`Found ${pkgFiles.length} package.json files`);

  const allInspections = [];
  for (const f of pkgFiles) {
    log(`\nInspecting ${f}`);
    const r = inspectPackageJson(f);
    allInspections.push(r);
    if (!r) {
      log(`  - Failed to parse ${f}`);
      continue;
    }
    log(`  - package name: ${r.name}`);
    log(`  - start script: ${!!r.startScript}`);
    log(`  - main entry: ${r.main || 'N/A'}`);
    for (const dep of r.results) {
      const ok = dep.exists.ok;
      const resolved = dep.exists.resolved;
      log(`    - ${dep.name}@${dep.requested} => exists: ${ok}, resolved: ${resolved || 'n/a'}, used_in: ${dep.usage.length}`);
    }
  }

  // check Dockerfile and .dockerignore
  const dockerfile = path.join(workspaceRoot, 'backend', 'Dockerfile');
  const dockerignore = path.join(workspaceRoot, 'backend', '.dockerignore');
  log('\nDockerfile and Dockerignore checks:');
  log(`  - Dockerfile exists: ${fs.existsSync(dockerfile)}`);
  log(`  - .dockerignore exists: ${fs.existsSync(dockerignore)}`);
  if (fs.existsSync(dockerfile)) {
    const df = fs.readFileSync(dockerfile, 'utf8');
    log(`  - Dockerfile contains npm ci --omit=dev: ${df.includes('npm ci --omit=dev')}`);
    log(`  - Dockerfile sets NODE_ENV=production: ${df.includes('NODE_ENV=production')}`);
  }

  // check backend entry
  const backendPkg = path.join(workspaceRoot, 'backend', 'package.json');
  if (fs.existsSync(backendPkg)) {
    const b = readJSON(backendPkg);
    log('\nBackend checks:');
    log(`  - start script present: ${b.scripts && b.scripts.start ? 'yes' : 'no'}`);
    const serverPath = path.join(workspaceRoot, 'backend', b.main || 'server.js');
    log(`  - entry point exists (${b.main || 'server.js'}): ${fs.existsSync(serverPath)}`);
  }

  // check required env vars referenced in validateEnv.js
  const validateEnvPath = path.join(workspaceRoot, 'backend', 'src', 'config', 'validateEnv.js');
  if (fs.existsSync(validateEnvPath)) {
    const content = fs.readFileSync(validateEnvPath, 'utf8');
    const matches = content.match(/const required = \[([\s\S]*?)\];/);
    if (matches) {
      const arr = matches[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
      log('\nEnvironment variable checks (from validateEnv.js):');
      for (const v of arr) {
        log(`  - ${v}: ${!!process.env[v]}`);
      }
    }
  }

  // save report
  const out = reportLines.join('\n');
  const outPath = path.join(workspaceRoot, 'backend', 'deployment-audit-report.txt');
  fs.writeFileSync(outPath, out, 'utf8');
  log(`\nSaved report to ${outPath}`);
}

main();
