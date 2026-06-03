const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;

const log = (...args) => console.log('[test-mongo]', ...args);
const logStep = (step) => log(`-- ${step}`);

const maskUriPassword = (rawUri) => {
  try {
    const parsed = new URL(rawUri);
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch (err) {
    return rawUri.replace(/:(?<password>[^@]+)@/, ':***@');
  }
};

const isSrvUri = (rawUri) => rawUri && rawUri.startsWith('mongodb+srv://');

const resolveSrvRecords = async (uriValue) => {
  let host;
  try {
    const parsed = new URL(uriValue);
    host = parsed.hostname;
  } catch (err) {
    host = uriValue.replace(/^mongodb\+srv:\/\//, '').split('/')[0].split('?')[0];
  }
  const srvName = `_mongodb._tcp.${host}`;
  logStep(`Resolving SRV records for ${srvName}`);

  const queryPromise = new Promise((resolve, reject) => {
    dns.resolveSrv(srvName, (err, records) => {
      if (err) {
        return reject(err);
      }
      resolve(records);
    });
  });

  const timeoutMs = 15000;
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`SRV lookup timeout after ${timeoutMs}ms for ${srvName}`));
    }, timeoutMs);
    queryPromise.finally(() => clearTimeout(timer));
  });

  return Promise.race([queryPromise, timeoutPromise]);
};

const buildNonSrvTemplate = (username, password, dbName, srvHosts) => {
  const authPart = username && password ? `${username}:***@` : '';
  const hostList = srvHosts && srvHosts.length
    ? srvHosts.map((record) => `${record.name}:${record.port}`).join(',')
    : '<host1>:<port>,<host2>:<port>,<host3>:<port>';
  const dbPart = dbName || '<database>';
  return `mongodb://${authPart}${hostList}/${dbPart}?ssl=true&replicaSet=<replicaSet>&authSource=admin&retryWrites=true&w=majority`;
};

const getUsernamePasswordFromUri = (rawUri) => {
  try {
    const parsed = new URL(rawUri);
    return { username: parsed.username || '', password: parsed.password || '' };
  } catch (err) {
    const match = rawUri.match(/mongodb(?:\+srv)?:\/\/([^:@]+):([^@]+)@/);
    return {
      username: match ? match[1] : '',
      password: match ? match[2] : '',
    };
  }
};

const suggestFixes = (err) => {
  if (!err || !err.message) {
    return;
  }
  logStep('Suggested next fix');
  if (err.message.includes('querySrv') || err.message.includes('DNSException') || err.message.includes('ENOTFOUND') || err.message.includes('ETIMEOUT')) {
    log('  - DNS lookup failed. Verify internet access and that your machine can resolve Atlas SRV records.');
    if (isSrvUri(uri)) {
      log('  - Try using a non-SRV connection string if your network cannot resolve `mongodb+srv://` URIs.');
    }
  }
  if (err.message.includes('Authentication failed') || err.message.includes('bad auth') || err.code === 18) {
    log('  - Authentication failure. Verify username, password, and database auth source in `MONGODB_URI`.');
  }
  if (err.message.includes('ETIMEDOUT') || err.message.includes('timeout')) {
    log('  - Network timeout. Ensure Atlas is reachable from your network and the cluster is online.');
  }
  if (err.message.includes('IP address is not authorized') || err.message.includes('IPWhitelist') || err.message.includes('IP address')) {
    log('  - Atlas IP whitelist error. Add your public IP or 0.0.0.0/0 to the Atlas network access list.');
  }
};

(async () => {
  try {
    logStep('Starting MongoDB Atlas diagnostics');
    logStep('Node version');
    log(process.version);
    logStep('Mongoose version');
    log(mongoose.version || mongoose.Mongoose?.version || 'unknown');
    logStep('Checking MONGODB_URI in environment');
    const hasUri = Boolean(uri && uri.trim());
    log('MONGODB_URI exists:', hasUri);
    logStep('Masked MongoDB URI');
    log(maskUriPassword(uri || '<missing>'));

    if (!hasUri) {
      throw new Error('Missing MONGODB_URI in environment (.env)');
    }

    if (isSrvUri(uri)) {
      try {
        const records = await resolveSrvRecords(uri);
        log('SRV records resolved:');
        records.forEach((record, idx) => {
          log(`  ${idx + 1}. ${record.name}:${record.port} (priority=${record.priority}, weight=${record.weight})`);
        });
        const { username, password } = getUsernamePasswordFromUri(uri);
        const dbName = (() => {
          try {
            const parsed = new URL(uri);
            return parsed.pathname.replace(/^\//, '') || 'bolt';
          } catch (err) {
            return uri.replace(/^mongodb\+srv:\/\//, '').split('/')[1]?.split('?')[0] || 'bolt';
          }
        })();
        logStep('Alternative non-SRV Atlas connection string template');
        log(buildNonSrvTemplate(username, password, dbName, records));
      } catch (dnsErr) {
        logStep('SRV lookup failed');
        log(dnsErr);
        suggestFixes(dnsErr);
        const { username, password } = getUsernamePasswordFromUri(uri);
        const dbName = (() => {
          try {
            const parsed = new URL(uri);
            return parsed.pathname.replace(/^\//, '') || '<database>';
          } catch (err) {
            return uri.replace(/^mongodb\+srv:\/\//, '').split('/')[1]?.split('?')[0] || '<database>';
          }
        })();
        logStep('Alternative non-SRV Atlas connection string template');
        log(buildNonSrvTemplate(username, password, dbName, []));
      }
    }

    logStep('Connecting to MongoDB with Mongoose');
    await mongoose.connect(uri, {
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      family: 4,
      maxPoolSize: 5,
    });
    log('✅ MongoDB Connected');

    const db = mongoose.connection.db;
    logStep('Database name');
    log(db.databaseName);

    logStep('Listing first 5 collection names');
    const collections = await db.listCollections().toArray();
    const names = collections.slice(0, 5).map((c) => c.name);
    log('Collections:', names.length ? names : '<no collections found>');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    log('❌ MongoDB connectivity test failed');
    log('Full error object:', err);
    log('Error name:', err && err.name);
    log('Error code:', err && err.code);
    log('Error message:', err && err.message);
    log('Error stack:', err && err.stack);
    suggestFixes(err);
    process.exit(1);
  }
})();
