import { useState, useEffect } from 'react'

interface ServiceStatus {
  name: string
  url: string
  status: 'online' | 'offline' | 'checking'
  responseTime?: number
  lastChecked?: string
}

const Dashboard = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Backend API', url: 'http://localhost:5001', status: 'checking' },
    { name: 'API Gateway', url: 'http://localhost:4000', status: 'checking' },
    { name: 'Service A', url: 'http://localhost:4001', status: 'checking' },
    { name: 'Service B', url: 'http://localhost:4002', status: 'checking' },
    { name: 'Prometheus', url: 'http://localhost:9090', status: 'checking' },
    { name: 'Grafana', url: 'http://localhost:3000', status: 'checking' },
  ])

  const [systemStats, setSystemStats] = useState({
    totalServices: 6,
    onlineServices: 0,
    offlineServices: 0,
    avgResponseTime: 0
  })

  const checkServiceStatus = async (service: ServiceStatus): Promise<ServiceStatus> => {
    const startTime = Date.now()
    try {
      // For external services, we'll use a simple fetch with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' // This allows us to check if service is reachable
      })
      
      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      
      return {
        ...service,
        status: 'online',
        responseTime,
        lastChecked: new Date().toLocaleTimeString()
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toLocaleTimeString()
      }
    }
  }

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services.map(service => checkServiceStatus(service))
    )
    
    setServices(updatedServices)
    
    const online = updatedServices.filter(s => s.status === 'online').length
    const offline = updatedServices.filter(s => s.status === 'offline').length
    const avgTime = updatedServices.reduce((acc, s) => acc + (s.responseTime || 0), 0) / updatedServices.length
    
    setSystemStats({
      totalServices: updatedServices.length,
      onlineServices: online,
      offlineServices: offline,
      avgResponseTime: Math.round(avgTime)
    })
  }

  useEffect(() => {
    checkAllServices()
    const interval = setInterval(checkAllServices, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-900/20'
      case 'offline': return 'text-red-400 bg-red-900/20'
      case 'checking': return 'text-yellow-400 bg-yellow-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '●'
      case 'offline': return '●'
      case 'checking': return '◐'
      default: return '○'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">System Overview</h2>
        <p className="text-gray-400">Real-time monitoring of WatchTower services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Services</p>
              <p className="text-2xl font-bold text-white">{systemStats.totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Online</p>
              <p className="text-2xl font-bold text-green-400">{systemStats.onlineServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">✗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-red-400">{systemStats.offlineServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Response</p>
              <p className="text-2xl font-bold text-purple-400">{systemStats.avgResponseTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Status */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Service Status</h3>
            <button
              onClick={checkAllServices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-700">
          {services.map((service, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)} {service.status}
                  </span>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white">{service.name}</p>
                    <p className="text-sm text-gray-400">{service.url}</p>
                  </div>
                </div>
                <div className="text-right">
                  {service.responseTime && (
                    <p className="text-sm text-gray-400">{service.responseTime}ms</p>
                  )}
                  {service.lastChecked && (
                    <p className="text-xs text-gray-500">Last checked: {service.lastChecked}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">Monitoring</h4>
          <div className="space-y-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 text-sm"
            >
              → Grafana Dashboard
            </a>
            <a
              href="http://localhost:9090"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 text-sm"
            >
              → Prometheus Metrics
            </a>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">Services</h4>
          <div className="space-y-2">
            <a
              href="http://localhost:4000"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 text-sm"
            >
              → API Gateway
            </a>
            <a
              href="http://localhost:5001"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 text-sm"
            >
              → Backend API
            </a>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h4 className="text-lg font-medium text-white mb-4">Database</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">MongoDB: localhost:27017</p>
            <p className="text-sm text-gray-400">Database: watchtower</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard