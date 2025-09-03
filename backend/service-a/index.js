const express = require('express');
const client = require('prom-client');
const app = express();
const PORT = process.env.PORT || 3001;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const dataRequestsTotal = new client.Counter({
  name: 'service_a_data_requests_total',
  help: 'Total number of data requests to Service A'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(dataRequestsTotal);

// Middleware
app.use(express.json());

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });
  
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    service: 'A', 
    status: 'Up', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/data', (req, res) => {
  dataRequestsTotal.inc();
  res.json({ 
    service: 'A',
    data: 'Sample data from Service A',
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Service A running on port ${PORT}`);
});
