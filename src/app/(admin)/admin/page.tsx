'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Car, FileText, Users } from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import RevenueChart from '@/components/shared/revenue-chart'
import { colors } from '@/lib/theme/colors'
import { fetchDashboardStats, fetchRecentActivities, DashboardStats, Activity } from '@/lib/api'

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, activitiesData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities()
        ])
        setDashboardData(statsData)
        setActivities(activitiesData.activities)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{error || 'No data available'}</div>
      </div>
    )
  }

  // Format currency values
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KSh ${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `KSh ${(value / 1000).toFixed(0)}K`
    } else {
      return `KSh ${value.toFixed(0)}`
    }
  }

  // Calculate trend for weekly vs monthly revenue
  const weeklyToMonthlyTrend = dashboardData.monthly_revenue > 0 
    ? ((dashboardData.weekly_revenue / (dashboardData.monthly_revenue / 4) - 1) * 100).toFixed(1)
    : '0.0'

  const stats = [
    {
      title: 'Monthly Revenue',
      value: formatCurrency(dashboardData.monthly_revenue),
      icon: DollarSign,
      trend: { 
        value: `${weeklyToMonthlyTrend}%`, 
        isPositive: parseFloat(weeklyToMonthlyTrend) >= 0 
      },
      color: colors.adminPrimary,
    },
    {
      title: 'Total Vehicles',
      value: dashboardData.total_vehicles.toString(),
      icon: Car,
      trend: { 
        value: `${dashboardData.available_vehicles} available`, 
        isPositive: true 
      },
      color: colors.adminSuccess,
    },
    {
      title: 'Active Contracts',
      value: dashboardData.active_contracts.toString(),
      icon: FileText,
      trend: { 
        value: `${dashboardData.contracts_created_today} today`, 
        isPositive: dashboardData.contracts_created_today > 0 
      },
      color: colors.adminAccent,
    },
    {
      title: 'Rented Vehicles',
      value: dashboardData.rented_vehicles.toString(),
      icon: Users,
      trend: { 
        value: `${dashboardData.fleet_utilization}% utilization`, 
        isPositive: dashboardData.fleet_utilization > 70 
      },
      color: colors.adminWarning,
    },
  ]

  // Prepare revenue chart data (last 7 days)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const revenueData = dashboardData.weekly_revenue_data.map((revenue, index) => ({
    day: days[index] || `Day ${index + 1}`,
    revenue: revenue,
  }))

  // Format activities for display
  const formatActivityTime = (timeString: string) => {
    const time = new Date(timeString)
    const now = new Date()
    const diffInMs = now.getTime() - time.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  const recentActivities = activities.map(activity => ({
    action: activity.title,
    time: formatActivityTime(activity.time),
    type: activity.type === 'success' ? 'success' : 
          activity.type === 'warning' ? 'warning' : 'info'
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Admin Dashboard
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Welcome back, Admin! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <DashboardCard title="Revenue Overview" subtitle="Last 7 days">
            <RevenueChart data={revenueData} height={256} />
          </DashboardCard>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <DashboardCard title="Quick Stats">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ color: colors.textSecondary }}>Fleet Utilization</span>
                <span className="font-semibold" style={{ color: colors.textPrimary }}>
                  {dashboardData.fleet_utilization}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: colors.textSecondary }}>Pending Approvals</span>
                <span className="font-semibold" style={{ color: colors.adminWarning }}>
                  {dashboardData.pending_approvals}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: colors.textSecondary }}>Maintenance Due</span>
                <span className="font-semibold" style={{ color: colors.adminError }}>
                  {dashboardData.maintenance_vehicles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: colors.textSecondary }}>Vehicle Expenses</span>
                <span className="font-semibold" style={{ color: colors.textPrimary }}>
                  {formatCurrency(dashboardData.vehicle_expenses)}
                </span>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <DashboardCard title="Recent Activity" subtitle="Latest updates from your system">
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full`}
                    style={{
                      backgroundColor:
                        activity.type === 'success'
                          ? colors.adminSuccess
                          : activity.type === 'warning'
                          ? colors.adminWarning
                          : colors.adminPrimary,
                    }}
                  />
                  <span style={{ color: colors.textPrimary }}>{activity.action}</span>
                </div>
                <span className="text-sm" style={{ color: colors.textTertiary }}>
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  )
}