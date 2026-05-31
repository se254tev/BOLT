const { validateEnv } = require('./src/config/validateEnv');
validateEnv();

const mongoose = require('mongoose');
const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.locals.mongoConnected = true;
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  app.locals.mongoConnected = false;
  console.error('Database connection error', err);
  process.exit(1);
});
