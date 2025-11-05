'use client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardChartsProps {
  data: {
    courses?: { label: string; value: number }[]
    sections?: { label: string; value: number }[]
    enrollments?: { label: string; value: number }[]
    schedules?: { label: string; value: number }[]
  }
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Courses Distribution Chart
  const coursesChartData = {
    labels: data.courses?.map(item => item.label) || [],
    datasets: [
      {
        label: 'Number of Courses',
        data: data.courses?.map(item => item.value) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  // Sections Over Time Chart
  const sectionsChartData = {
    labels: data.sections?.map(item => item.label) || [],
    datasets: [
      {
        label: 'Sections Created',
        data: data.sections?.map(item => item.value) || [],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  }

  // Enrollment Distribution (Doughnut)
  const enrollmentChartData = {
    labels: data.enrollments?.map(item => item.label) || [],
    datasets: [
      {
        data: data.enrollments?.map(item => item.value) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'SmartSchedule Analytics',
      },
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Courses Distribution Bar Chart */}
      {data.courses && data.courses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Courses Distribution</h3>
          <div className="h-64">
            <Bar data={coursesChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Sections Over Time Line Chart */}
      {data.sections && data.sections.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sections Over Time</h3>
          <div className="h-64">
            <Line data={sectionsChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Enrollment Distribution Doughnut Chart */}
      {data.enrollments && data.enrollments.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Enrollment Distribution</h3>
          <div className="h-64">
            <Doughnut data={enrollmentChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Schedules Status Chart */}
      {data.schedules && data.schedules.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Schedule Status</h3>
          <div className="h-64">
            <Bar
              data={{
                labels: data.schedules.map(item => item.label),
                datasets: [
                  {
                    label: 'Schedules',
                    data: data.schedules.map(item => item.value),
                    backgroundColor: 'rgba(168, 85, 247, 0.5)',
                    borderColor: 'rgba(168, 85, 247, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
      )}
    </div>
  )
}

