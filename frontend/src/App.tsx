import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ServiceMonitor from './components/ServiceMonitor'
import ApiTester from './components/ApiTester'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-blue-400">WatchTower</h1>
              <span className="ml-2 text-sm text-gray-400">Monitoring Dashboard</span>
            </div>
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'services'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('api-test')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'api-test'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                API Tester
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'services' && <ServiceMonitor />}
        {activeTab === 'api-test' && <ApiTester />}
      </main>
    </div>
  )
}

export default App