#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
      walk(full, cb);
    } else {
      cb(full);
    }
  }
}

function isCodeFile(file) {
  return /\.(js|cjs|mjs|jsx|ts|tsx)$/i.test(file);
}

function extractImports(code) {
  const imports = new Set();
  const requireRe = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  const importFromRe = /import\s+(?:[^'";]+?)?from\s+['"`]([^'"`]+)['"`]/g;
  const importBareRe = /import\s+['"`]([^'"`]+)['"`]/g; // side-effect imports
  const dynamicRe = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

  let m;
  while ((m = requireRe.exec(code))) imports.add(m[1]);
  while ((m = importFromRe.exec(code))) imports.add(m[1]);
  while ((m = importBareRe.exec(code))) imports.add(m[1]);
  while ((m = dynamicRe.exec(code))) imports.add(m[1]);
  return Array.from(imports);
}

function isLocal(moduleName) {
  return moduleName.startsWith('.') || moduleName.startsWith('/') || moduleName.match(/^\.\.\//);
}

function topLevelPackage(mod) {
  if (!mod) return null;
  if (mod.startsWith('@')) {
    const parts = mod.split('/');
    return parts.length >= 2 ? parts.slice(0,2).join('/') : mod;
  }
  return mod.split('/')[0];
}

function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch(e) { return null; }
}

function saveJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

function findPackageJsons(root) {
  const results = [];
  walk(root, (f)=>{
    if (path.basename(f) === 'package.json') results.push(f);
  });
  return results;
}

function analyzePackage(pkgPath) {
  const pkgDir = path.dirname(pkgPath);
  const pkg = loadJSON(pkgPath);
  if (!pkg) return null;
  const used = new Set();

  const DEV_FILE_RE = /(\\|\/)?(test|tests)(\\|\/)|\.test\.|\.spec\.|tailwind\.config\.js$|vite\.config\.js$|postcss\.config\.js$|postcss\.config\.cjs$|webpack\.config\.js$|rollup\.config\.js$|jest\.config\.js$|\.config\.js$/i;

  walk(pkgDir, (file) => {
    if (!isCodeFile(file)) return;
    // skip test files and build/config files which are executed during build time
    if (DEV_FILE_RE.test(file)) return;
    try {
      const code = fs.readFileSync(file, 'utf8');
      const imports = extractImports(code);
      imports.forEach(mod => {
        if (!isLocal(mod)) {
          const top = topLevelPackage(mod);
          if (top) used.add(top);
        }
      });
    } catch(e) {
      // ignore unreadable
    }
  });

  const deps = Object.assign({}, pkg.dependencies || {});
  const dev = Object.assign({}, pkg.devDependencies || {});
  const allDeclared = new Set([...Object.keys(deps), ...Object.keys(dev)]);

  const usedArr = Array.from(used).sort();
  // ignore Node builtins and template placeholders
  const NODE_BUILTINS = new Set([
    'fs','path','util','events','stream','buffer','http','https','url','querystring','crypto','os','child_process','zlib','assert','tty','dns','net','tls','readline','perf_hooks'
  ]);
  const missingRaw = usedArr.filter(x => !allDeclared.has(x));
  const missing = missingRaw.filter(m => {
    if (!m) return false;
    if (m.includes('${')) return false;
    if (m.startsWith('node:')) return false;
    if (NODE_BUILTINS.has(m)) return false;
    return true;
  });
  // runtimeInDev should only include packages used in non-test/non-build files
  const runtimeInDev = Array.from(used).filter(x => dev.hasOwnProperty(x));
  const unused = Array.from(allDeclared).filter(x => !used.has(x));

  return { pkgPath, pkgDir, pkg, deps, dev, used: usedArr, missing, missingRaw, runtimeInDev, unused };
}

function run(root) {
  const packageFiles = findPackageJsons(root);
  const report = {
    checkedAt: new Date().toISOString(),
    packages: [],
  };

  for (const p of packageFiles) {
    const res = analyzePackage(p);
    if (!res) continue;
    report.packages.push(res);

    // Auto-fix: move runtime deps from devDependencies -> dependencies
    if (res.runtimeInDev.length) {
      const pkg = res.pkg;
      pkg.dependencies = pkg.dependencies || {};
      pkg.devDependencies = pkg.devDependencies || {};
      res.runtimeInDev.forEach(name => {
        const v = pkg.devDependencies[name];
        if (v) {
          // don't overwrite existing dependency
          if (!pkg.dependencies[name]) {
            pkg.dependencies[name] = v;
            delete pkg.devDependencies[name];
          }
        }
      });
      saveJSON(p, pkg);
      res._autoMoved = res.runtimeInDev.slice();
    }

    // Ensure check:deps script exists in this package.json
    const pkgObj = res.pkg;
    pkgObj.scripts = pkgObj.scripts || {};
    if (!pkgObj.scripts['check:deps']) {
      pkgObj.scripts['check:deps'] = 'node scripts/check-dependencies.js';
      saveJSON(p, pkgObj);
      res._scriptAdded = true;
    }
  }

  // write a human report file
  const lines = [];
  lines.push('=== DEPENDENCY AUDIT ===');
  lines.push(`Checked at: ${report.checkedAt}`);
  lines.push('');

  const missingGlobal = [];
  const runtimeMoved = [];
  const unusedGlobal = [];

  for (const pkg of report.packages) {
    lines.push(`Package.json: ${pkg.pkgPath}`);
    if (pkg.missing.length) {
      lines.push('  MISSING:');
      pkg.missing.forEach(m => {
        lines.push(`    - ${m}`);
        missingGlobal.push({ packageJson: pkg.pkgPath, name: m });
      });
    } else {
      lines.push('  MISSING: none');
    }
    if (pkg.runtimeInDev.length) {
      lines.push('  RUNTIME in devDependencies (moved to dependencies):');
      pkg.runtimeInDev.forEach(r=>{
        lines.push(`    - ${r}`);
        runtimeMoved.push({ packageJson: pkg.pkgPath, name: r });
      });
    } else {
      lines.push('  RUNTIME in devDependencies: none');
    }
    if (pkg.unused.length) {
      lines.push('  UNUSED (candidates):');
      pkg.unused.forEach(u=>{
        lines.push(`    - ${u}`);
        unusedGlobal.push({ packageJson: pkg.pkgPath, name: u });
      });
    } else {
      lines.push('  UNUSED: none');
    }
    if (pkg._autoMoved) lines.push(`  _autoMoved: ${pkg._autoMoved.join(', ')}`);
    if (pkg._scriptAdded) lines.push('  _scriptAdded: check:deps');
    lines.push('');
  }

  // suggest npm commands
  if (missingGlobal.length) {
    lines.push('=== SUGGESTED INSTALL COMMANDS ===');
    const byPkg = {};
    missingGlobal.forEach(m => {
      const folder = path.dirname(m.packageJson);
      byPkg[folder] = byPkg[folder] || new Set();
      byPkg[folder].add(m.name);
    });
    for (const folder of Object.keys(byPkg)) {
      const pkgs = Array.from(byPkg[folder]).join(' ');
      lines.push(`cd ${folder} && npm install ${pkgs}`);
    }
    lines.push('');
  } else {
    lines.push('No missing packages detected.');
    lines.push('');
  }

  fs.writeFileSync(path.join(root, 'dependency-audit-report.txt'), lines.join('\n'));
  console.log(lines.join('\n'));
}

if (require.main === module) {
  const root = process.cwd();
  run(root);
}
