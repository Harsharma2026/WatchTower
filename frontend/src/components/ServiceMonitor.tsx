import { useState, useEffect } from 'react'

interface ServiceInfo {
  name: string
  url: string
  description: string
  endpoints: string[]
  status: 'online' | 'offline' | 'checking'
  details?: any
}

const ServiceMonitor = () => {
  const [services, setServices] = useState<ServiceInfo[]>([
    {
      name: 'Backend API',
      url: 'http://localhost:5001',
      description: 'Main backend service handling core application logic',
      endpoints: ['/', '/health', '/api/users', '/api/data'],
      status: 'checking'
    },
    {
      name: 'API Gateway',
      url: 'http://localhost:4000',
      description: 'Gateway service routing requests to microservices',
      endpoints: ['/', '/service-a', '/service-b', '/health'],
      status: 'checking'
    },
    {
      name: 'Service A',
      url: 'http://localhost:4001',
      description: 'Microservice A handling specific business logic',
      endpoints: ['/', '/health', '/metrics'],
      status: 'checking'
    },
    {
      name: 'Service B',
      url: 'http://localhost:4002',
      description: 'Microservice B handling additional business logic',
      endpoints: ['/', '/health', '/metrics'],
      status: 'checking'
    }
  ])

  const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null)
  const [endpointResults, setEndpointResults] = useState<Record<string, any>>({})

  const testEndpoint = async (serviceUrl: string, endpoint: string) => {
    try {
      const fullUrl = `${serviceUrl}${endpoint}`
      const response = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
      })
      
      const data = await response.text()
      return {
        status: response.status,
        statusText: response.statusText,
        data: data,
        success: response.ok
      }
    } catch (error) {
      return {
        status: 0,
        statusText: 'Network Error',
        data: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
    }
  }

  const testAllEndpoints = async (service: ServiceInfo) => {
    setSelectedService(service)
    const results: Record<string, any> = {}
    
    for (const endpoint of service.endpoints) {
      const result = await testEndpoint(service.url, endpoint)
      results[endpoint] = result
    }
    
    setEndpointResults(results)
  }

  const checkServiceHealth = async (service: ServiceInfo): Promise<ServiceInfo> => {
    try {
      const result = await testEndpoint(service.url, '/')
      return {
        ...service,
        status: result.success ? 'online' : 'offline',
        details: result
      }
    } catch (error) {
      return {
        ...service,
        status: 'offline',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  const checkAllServices = async () => {
    const updatedServices = await Promise.all(
      services.map(service => checkServiceHealth(service))
    )
    setServices(updatedServices)
  }

  useEffect(() => {
    checkAllServices()
    const interval = setInterval(checkAllServices, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800'
      case 'offline': return 'bg-red-100 text-red-800'
      case 'checking': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Service Monitor</h2>
        <p className="text-gray-400">Detailed monitoring and testing of individual services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Services List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Services</h3>
            <button
              onClick={checkAllServices}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Refresh All
            </button>
          </div>

          {services.map((service, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-white">{service.name}</h4>
                  <p className="text-sm text-gray-400">{service.url}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {service.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  {service.endpoints.length} endpoints available
                </div>
                <button
                  onClick={() => testAllEndpoints(service)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Test Endpoints
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Endpoint Testing Results */}
        <div>
          <h3 className="text-lg font-medium text-white mb-6">Endpoint Testing</h3>
          
          {selectedService ? (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white">{selectedService.name}</h4>
                <p className="text-sm text-gray-400">{selectedService.url}</p>
              </div>

              <div className="space-y-4">
                {selectedService.endpoints.map((endpoint, index) => {
                  const result = endpointResults[endpoint]
                  
                  return (
                    <div key={index} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm text-blue-400">{endpoint}</code>
                        {result && (
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status} {result.statusText}
                          </span>
                        )}
                      </div>
                      
                      {result && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-400 mb-1">Response:</div>
                          <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto text-gray-300">
                            {typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">Select a service to test its endpoints</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceMonitor