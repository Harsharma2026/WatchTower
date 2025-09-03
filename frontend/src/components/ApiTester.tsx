import { useState } from 'react'

interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  headers: Record<string, string>
  body: string
}

interface ApiResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  responseTime: number
}

const ApiTester = () => {
  const [request, setRequest] = useState<ApiRequest>({
    method: 'GET',
    url: 'http://localhost:5001/',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ''
  })

  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Array<{ request: ApiRequest; response: ApiResponse; timestamp: string }>>([])

  const predefinedRequests = [
    {
      name: 'Backend Health Check',
      method: 'GET' as const,
      url: 'http://localhost:5001/',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'API Gateway Health',
      method: 'GET' as const,
      url: 'http://localhost:4000/',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'Service A Status',
      method: 'GET' as const,
      url: 'http://localhost:4001/',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'Service B Status',
      method: 'GET' as const,
      url: 'http://localhost:4002/',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'Gateway -> Service A',
      method: 'GET' as const,
      url: 'http://localhost:4000/service-a',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    },
    {
      name: 'Gateway -> Service B',
      method: 'GET' as const,
      url: 'http://localhost:4000/service-b',
      headers: { 'Content-Type': 'application/json' },
      body: ''
    }
  ]

  const sendRequest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers,
        mode: 'cors'
      }

      if (request.method !== 'GET' && request.body) {
        fetchOptions.body = request.body
      }

      const fetchResponse = await fetch(request.url, fetchOptions)
      const responseTime = Date.now() - startTime
      
      // Try to parse as JSON, fallback to text
      let data
      const contentType = fetchResponse.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await fetchResponse.json()
        } catch {
          data = await fetchResponse.text()
        }
      } else {
        data = await fetchResponse.text()
      }

      const responseHeaders: Record<string, string> = {}
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const apiResponse: ApiResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        data,
        responseTime
      }

      setResponse(apiResponse)
      
      // Add to history
      setHistory(prev => [{
        request: { ...request },
        response: apiResponse,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]) // Keep last 10 requests

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
      
      setResponse(errorResponse)
    } finally {
      setLoading(false)
    }
  }

  const loadPredefinedRequest = (predefined: typeof predefinedRequests[0]) => {
    setRequest({
      method: predefined.method,
      url: predefined.url,
      headers: predefined.headers,
      body: predefined.body
    })
  }

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        '': ''
      }
    }))
  }

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers }
      if (oldKey !== newKey) {
        delete newHeaders[oldKey]
      }
      newHeaders[newKey] = value
      return {
        ...prev,
        headers: newHeaders
      }
    })
  }

  const removeHeader = (key: string) => {
    setRequest(prev => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return {
        ...prev,
        headers: newHeaders
      }
    })
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">API Tester</h2>
        <p className="text-gray-400">Test API endpoints and view responses</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Predefined Requests */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Quick Tests</h3>
            <div className="grid grid-cols-2 gap-2">
              {predefinedRequests.map((req, index) => (
                <button
                  key={index}
                  onClick={() => loadPredefinedRequest(req)}
                  className="text-left p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white"
                >
                  {req.name}
                </button>
              ))}
            </div>
          </div>

          {/* Request Configuration */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Request</h3>
            
            {/* Method and URL */}
            <div className="flex gap-4 mb-4">
              <select
                value={request.method}
                onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value as any }))}
                className="bg-gray-700 text-white px-3 py-2 rounded"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
              
              <input
                type="text"
                value={request.url}
                onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter URL"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded"
              />
              
              <button
                onClick={sendRequest}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded font-medium"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            {/* Headers */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Headers</label>
                <button
                  onClick={addHeader}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  + Add Header
                </button>
              </div>
              
              <div className="space-y-2">
                {Object.entries(request.headers).map(([key, value], index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateHeader(key, e.target.value, value)}
                      placeholder="Header name"
                      className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateHeader(key, key, e.target.value)}
                      placeholder="Header value"
                      className="flex-1 bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    />
                    <button
                      onClick={() => removeHeader(key)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {request.method !== 'GET' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Body</label>
                <textarea
                  value={request.body}
                  onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Request body (JSON, etc.)"
                  rows={6}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Response and History */}
        <div className="space-y-6">
          {/* Response */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Response</h3>
            
            {response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-green-100 text-green-800'
                      : response.status >= 400
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-400">{response.responseTime}ms</span>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Headers:</div>
                  <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto text-gray-300">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>

                <div>
                  <div className="text-sm text-gray-400 mb-1">Body:</div>
                  <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto text-gray-300 max-h-64">
                    {typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No response yet</p>
            )}
          </div>

          {/* History */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">History</h3>
            
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setRequest(item.request)
                      setResponse(item.response)
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">
                        {item.request.method} {new URL(item.request.url).pathname}
                      </span>
                      <span className={`text-xs ${
                        item.response.status >= 200 && item.response.status < 300
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {item.response.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">{item.timestamp}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No requests yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiTester