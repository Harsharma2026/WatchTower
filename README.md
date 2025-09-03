# WatchTower

A modern microservices application with React frontend, Node.js backend, and MongoDB database.

## Architecture

- **Frontend**: React + TypeScript + Vite + TailwindCSS (Port 8080)
- **Backend**: Node.js + Express + TypeScript + MongoDB (Port 5001)
- **API Gateway**: Express.js gateway for microservices (Port 4000)
- **Service A**: Microservice A (Port 4001)
- **Service B**: Microservice B (Port 4002)
- **Database**: MongoDB (Port 27017)
- **Monitoring**: Prometheus (Port 9090) + Grafana (Port 3000)
- **System Metrics**: Node Exporter (Port 9100)

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd WatchTower

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5001
# API Gateway: http://localhost:4000
# Service A: http://localhost:4001
# Service B: http://localhost:4002
# Grafana Dashboard: http://localhost:3000 (admin/admin123)
# Prometheus: http://localhost:9090
```

### Local Development

#### Prerequisites

- Node.js 18+
- MongoDB
- npm or yarn

#### Backend Setup

```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### Microservices Setup

```bash
# API Gateway
cd backend/api-gateway
npm install
npm run dev

# Service A
cd backend/service-a
npm install
npm run dev

# Service B
cd backend/service-b
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=5001
MONGO_URI=mongodb://mongo:27017/watchtower
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5001
VITE_GATEWAY_URL=http://localhost:4000
```

## API Endpoints

### Backend (Port 5001)
- `GET /` - Health check
- `GET /health` - Detailed health status
- `GET /metrics` - Prometheus metrics

### API Gateway (Port 4000)
- `GET /services-health` - Check health of all microservices
- `GET /health` - Gateway health check
- `GET /metrics` - Prometheus metrics

### Service A (Port 4001)
- `GET /health` - Service A health check
- `GET /api/data` - Sample data endpoint
- `GET /metrics` - Prometheus metrics

### Service B (Port 4002)
- `GET /health` - Service B health check
- `GET /api/data` - Sample data endpoint
- `GET /metrics` - Prometheus metrics

## Monitoring & Observability

### Grafana Dashboard (Port 3000)
- **URL**: http://localhost:3000
- **Username**: admin
- **Password**: admin123
- **Features**:
  - Service status monitoring
  - CPU and memory usage
  - Network I/O metrics
  - Custom WatchTower dashboard
  - Real-time alerts

### Prometheus (Port 9090)
- **URL**: http://localhost:9090
- **Features**:
  - Metrics collection from all services
  - Custom application metrics
  - System metrics via Node Exporter
  - Alert rules for service monitoring

### Available Metrics
- `http_requests_total` - Total HTTP requests per service
- `http_request_duration_seconds` - Request duration histograms
- `service_health_status` - Service health indicators
- `mongodb_connection_status` - Database connection status
- `service_a_data_requests_total` - Service A data requests
- `service_b_data_requests_total` - Service B data requests
- System metrics (CPU, memory, disk, network)

### Alerts
- Service downtime detection
- High CPU usage (>80%)
- High memory usage (>85%)
- Low disk space (<10%)

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (frontend only)

### Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]
```

## Project Structure

```
WatchTower/
├── backend/
│   ├── src/
│   │   └── index.ts          # Main backend server
│   ├── api-gateway/
│   │   ├── index.js          # API Gateway
│   │   └── Dockerfile
│   ├── service-a/
│   │   ├── index.js          # Microservice A
│   │   └── Dockerfile
│   ├── service-b/
│   │   ├── index.js          # Microservice B
│   │   └── Dockerfile
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml    # Prometheus configuration
│   │   └── alert_rules.yml   # Alert rules
│   └── grafana/
│       └── provisioning/     # Grafana dashboards & datasources
├── docker-compose.yml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
