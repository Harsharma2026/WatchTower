const express = require('express');
const axios = require('axios');
const client = require('prom-client');
const app = express();
const PORT = process.env.PORT || 3000;

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

const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of downstream services (1 = healthy, 0 = unhealthy)',
  labelNames: ['service']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(serviceHealthStatus);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ service: 'API Gateway', status: 'Up', timestamp: new Date().toISOString() });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/services-health', async (req, res) => {
  try {
    // In Docker, use container names; locally use localhost
    const serviceAUrl = process.env.DOCKER_ENV ? 'http://watchtower-service-a:3001' : 'http://localhost:4001';
    const serviceBUrl = process.env.DOCKER_ENV ? 'http://watchtower-service-b:3002' : 'http://localhost:4002';
    
    const [a, b] = await Promise.all([
      axios.get(`${serviceAUrl}/health`),
      axios.get(`${serviceBUrl}/health`)
    ]);
    
    // Update service health metrics
    serviceHealthStatus.labels('service-a').set(1);
    serviceHealthStatus.labels('service-b').set(1);
    
    res.json({
      serviceA: a.data,
      serviceB: b.data
    });
  } catch (error) {
    console.error('Error connecting to services:', error.message);
    
    // Update service health metrics for failed services
    serviceHealthStatus.labels('service-a').set(0);
    serviceHealthStatus.labels('service-b').set(0);
    
    res.status(500).json({ 
      error: 'One or more services are down',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
