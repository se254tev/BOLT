const { validateEnv } = require('./src/config/validateEnv');
validateEnv();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');
const config = require('./src/config');
const { initRealtimeGateway } = require('./src/services/requests/realtime.gateway');

// Startup diagnostics for Redis configuration
console.log('Redis URL source:', process.env.REDIS_URL ? 'ENVIRONMENT' : 'MISSING');

const PORT = config.port;

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.locals.mongoConnected = true;
  console.log('MongoDB connected');
  const server = http.createServer(app);
  initRealtimeGateway(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  app.locals.mongoConnected = false;
  console.error('Database connection error', err);
  process.exit(1);
});
