'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import {
  fetchDashboardStats,
  fetchPendingContracts,
  fetchRecentActivities,
  Contract,
  DashboardStats,
  Activity
} from '@/lib/api'

export default function SupervisorDashboard() {
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [monitorContracts, setMonitorContracts] = useState<Contract[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, contractsData, activitiesData] = await Promise.all([
          fetchDashboardStats(),
          fetchPendingContracts(),
          fetchRecentActivities()
        ])
        setDashboardStats(statsData)
        setMonitorContracts(contractsData)
        setActivities(activitiesData.activities)
      } catch (error) {
        console.error('Error loading supervisor dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Supervisor-focused data
  const stats = [
    {
      title: 'Pending Approvals',
      value: dashboardStats?.pending_approvals.toString() || '0',
      icon: CheckSquare,
      trend: { value: '+0', isPositive: false }, // Trends not available in API yet
      color: colors.supervisorPrimaryLight,
    },
    {
      title: 'Active Supervision',
      value: dashboardStats?.active_contracts.toString() || '0',
      icon: TrendingUp,
      trend: { value: '+0', isPositive: true },
      color: colors.supervisorAccent,
    },
    {
      title: 'Issues to Review',
      value: '0', // Placeholder as API doesn't provide this yet
      icon: AlertTriangle,
      trend: { value: '0', isPositive: true },
      color: colors.adminError,
    },
    {
      title: 'Processing Time',
      value: '0h', // Placeholder
      icon: Clock,
      trend: { value: '0h', isPositive: true },
      color: colors.supervisorPrimaryDark,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Supervisor Dashboard
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Welcome back, Supervisor! Here's your oversight overview.
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <DashboardCard title="Pending Approvals" subtitle="Items requiring your attention">
            <div className="space-y-3">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : monitorContracts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No pending approvals</div>
              ) : (
                monitorContracts.slice(0, 5).map((contract, index) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: colors.supervisorPrimary,
                        }}
                      />
                      <div>
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {contract.client?.first_name
                            ? `${contract.client.first_name} ${contract.client.last_name || ''}`
                            : contract.client?.email || 'Unknown Client'}
                        </p>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          Contract - {parseInt(contract.total_contract_value).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm" style={{ color: colors.textTertiary }}>
                      {new Date(contract.created_at).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Recent Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <DashboardCard title="Recent Actions" subtitle="Your recent supervisory activities">
            <div className="space-y-3">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : activities.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No recent actions</div>
              ) : (
                activities.slice(0, 5).map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: colors.supervisorSecondary,
                        }}
                      />
                      <span style={{ color: colors.textPrimary }}>{action.title}</span>
                    </div>
                    <span className="text-sm" style={{ color: colors.textTertiary }}>
                      {action.time}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </DashboardCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <DashboardCard title="Quick Actions" subtitle="Common supervisory tasks">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              style={{ borderColor: colors.borderLight }}
            >
              <div className="flex items-center gap-3">
                <CheckSquare size={20} style={{ color: colors.supervisorPrimary }} />
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  Review Contracts
                </span>
              </div>
            </button>

            <button
              className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
              style={{ borderColor: colors.borderLight }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={20} style={{ color: colors.supervisorAccent }} />
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  Performance Report
                </span>
              </div>
            </button>

            <button
              className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
              style={{ borderColor: colors.borderLight }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} style={{ color: colors.supervisorPrimaryLight }} />
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  Handle Issues
                </span>
              </div>
            </button>
          </div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  )
}