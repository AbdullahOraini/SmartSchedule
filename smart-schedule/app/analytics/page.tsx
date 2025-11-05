'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { DashboardCharts } from '../../components/DashboardCharts'
import { AppHeader } from '../../components/AppHeader'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any>({})
  const [summary, setSummary] = useState<any>({})

  useEffect(() => {
    if (isAuthenticated()) {
      loadAnalytics()
    }
  }, [isAuthenticated])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSummary(result.data.summary)
          setChartData(result.data.charts)
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="Analytics Dashboard" showBack={false} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <svg
                className="animate-spin h-12 w-12 mx-auto text-blue-600"
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
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Courses</h3>
                  <p className="text-3xl font-bold text-blue-600">{summary.courses || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sections</h3>
                  <p className="text-3xl font-bold text-green-600">{summary.sections || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Students</h3>
                  <p className="text-3xl font-bold text-purple-600">{summary.students || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Faculty</h3>
                  <p className="text-3xl font-bold text-orange-600">{summary.faculty || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Schedules</h3>
                  <p className="text-3xl font-bold text-indigo-600">{summary.schedules || 0}</p>
                </div>
              </div>

              {/* Charts */}
              <DashboardCharts data={chartData} />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

