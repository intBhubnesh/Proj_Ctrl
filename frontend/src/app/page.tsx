'use client'

import { useState, useEffect } from 'react'
import { api, endpoints } from '@/lib/api'

type HealthResponse = {
  status: string
  message: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Test backend connection
        const health = await api.get(endpoints.health)
        setHealthStatus(health)
        
        // Fetch users
        const usersData = await api.get(endpoints.users)
        setUsers(usersData)
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        console.error('API Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const createTestUser = async () => {
    try {
      const newUser = await api.post(endpoints.users, {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        role: 'STUDENT'
      })
      setUsers(prev => [...prev, newUser])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Project Control System</h1>
          <p className="text-gray-600">Next.js + Elysia.js + Prisma + PostgreSQL + Tailwind CSS</p>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Backend Health Status */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Backend Status</h2>
              {healthStatus && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">{healthStatus.message}</span>
                </div>
              )}
            </div>

            {/* Users Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Users ({users.length})</h2>
                <button
                  onClick={createTestUser}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Test User
                </button>
              </div>
              
              {users.length === 0 ? (
                <p className="text-gray-500">No users found. Try creating a test user!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'FACULTY' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tech Stack Info */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="font-semibold">Next.js</div>
                  <div className="text-sm text-gray-600">Frontend</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl mb-2">🦊</div>
                  <div className="font-semibold">Elysia.js</div>
                  <div className="text-sm text-gray-600">Backend</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-semibold">Prisma</div>
                  <div className="text-sm text-gray-600">ORM</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded">
                  <div className="text-2xl mb-2">🐘</div>
                  <div className="font-semibold">PostgreSQL</div>
                  <div className="text-sm text-gray-600">Database</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
