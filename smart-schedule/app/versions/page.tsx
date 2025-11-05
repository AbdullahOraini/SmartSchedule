'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { AppHeader } from '../../components/AppHeader'
import { useRouter, useSearchParams } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function VersionsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get('scheduleId') || ''

  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingVersion, setCreatingVersion] = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionDescription, setVersionDescription] = useState('')

  useEffect(() => {
    if (isAuthenticated() && scheduleId) {
      loadVersions()
    }
  }, [isAuthenticated, scheduleId])

  const loadVersions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/versions/${scheduleId}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setVersions(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVersion = async () => {
    if (!versionName.trim()) {
      alert('Please enter a version name')
      return
    }

    setCreatingVersion(true)
    try {
      const response = await fetch(`${API_BASE_URL}/versions/${scheduleId}/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: versionName,
          description: versionDescription,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setVersionName('')
        setVersionDescription('')
        await loadVersions()
        alert('Version created successfully!')
      } else {
        alert(result.error || 'Failed to create version')
      }
    } catch (error) {
      console.error('Failed to create version:', error)
      alert('Failed to create version')
    } finally {
      setCreatingVersion(false)
    }
  }

  const handleRestoreVersion = async (version: number) => {
    if (!confirm(`Are you sure you want to restore version ${version}?`)) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/versions/${scheduleId}/${version}/restore`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      const result = await response.json()

      if (response.ok && result.success) {
        await loadVersions()
        alert(result.message)
      } else {
        alert(result.error || 'Failed to restore version')
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
      alert('Failed to restore version')
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  if (!scheduleId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <AppHeader title="Version Control" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600">Please select a schedule to view versions.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Version Control" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Create New Version */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Version</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version Name
                </label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g., Fall 2024 Final"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="Describe the changes in this version..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreateVersion}
                disabled={creatingVersion}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {creatingVersion ? 'Creating...' : 'Create Version'}
              </button>
            </div>
          </div>

          {/* Versions List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Version History</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <svg
                  className="animate-spin h-8 w-8 mx-auto text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No versions found for this schedule.</p>
                <p className="text-sm mt-2">Create a version to get started.</p>
              </div>
            ) : (
              <div className="divide-y">
                {versions.map((version) => (
                  <div key={version.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {version.name}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            v{version.version}
                          </span>
                          {version.version === versions[0]?.version && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Current
                            </span>
                          )}
                        </div>
                        {version.description && (
                          <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                        )}
                        <div className="text-xs text-gray-500">
                          Created: {new Date(version.createdAt).toLocaleString()}
                          {version.createdBy && ` • Created by: ${version.createdBy}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {version.version !== versions[0]?.version && (
                          <button
                            onClick={() => handleRestoreVersion(version.version)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Restore
                          </button>
                        )}
                        <button
                          onClick={() =>
                            router.push(`/versions/details?scheduleId=${scheduleId}&version=${version.version}`)
                          }
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

