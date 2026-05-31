const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

const httpRequestCount = new client.Counter({
  name: 'http_request_count',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(httpRequestCount);

const observeRequest = (labels, durationSeconds) => {
  httpRequestDurationSeconds.labels(labels.method, labels.route, labels.status_code).observe(durationSeconds);
  httpRequestCount.labels(labels.method, labels.route, labels.status_code).inc();
};

module.exports = { register, observeRequest };
