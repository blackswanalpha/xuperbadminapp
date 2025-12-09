'use client'

import { motion } from 'framer-motion'
import { BarChart3, DollarSign, TrendingDown, Car, FileText, Download, Eye } from 'lucide-react'
import Link from 'next/link'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function ReportsPage() {
  const stats = [
    {
      title: 'Total Reports',
      value: '12',
      icon: FileText,
      trend: { value: '+3', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Monthly Revenue',
      value: 'KSh 450K',
      icon: DollarSign,
      trend: { value: '+12.5%', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Fleet Utilization',
      value: '75%',
      icon: Car,
      trend: { value: '+5.2%', isPositive: true },
      color: colors.adminAccent,
    },
    {
      title: 'Total Expenses',
      value: 'KSh 125K',
      icon: TrendingDown,
      trend: { value: '+8.2%', isPositive: false },
      color: colors.adminWarning,
    },
  ]

  const reports = [
    {
      title: 'Monthly Revenue Report',
      description: 'Comprehensive analysis of monthly revenue performance, growth trends, and contract values',
      icon: DollarSign,
      color: colors.adminPrimary,
      lastUpdated: '2 hours ago',
      href: '/dashboard/reports/view/Monthly%20Revenue%20Report',
      metrics: {
        revenue: 'KSh 450K',
        growth: '+12.5%',
        contracts: '24'
      }
    },
    {
      title: 'Expense Breakdown',
      description: 'Detailed breakdown of fleet expenses by category, vehicle, and cost optimization opportunities',
      icon: TrendingDown,
      color: colors.adminError,
      lastUpdated: '4 hours ago',
      href: '/dashboard/reports/view/Expense%20Breakdown',
      metrics: {
        total: 'KSh 125K',
        maintenance: '36%',
        fuel: '30.4%'
      }
    },
    {
      title: 'Vehicle Utilization Analysis',
      description: 'Fleet performance metrics, usage patterns, and vehicle efficiency analysis',
      icon: Car,
      color: colors.adminAccent,
      lastUpdated: '6 hours ago',
      href: '/dashboard/reports/view/Vehicle%20Utilization%20Analysis',
      metrics: {
        utilization: '75%',
        active: '18/24',
        efficiency: '82%'
      }
    },
  ]

  const quickActions = [
    { label: 'Export All Reports', icon: Download, color: colors.adminPrimary },
    { label: 'Schedule Report', icon: FileText, color: colors.adminAccent },
    { label: 'Report Settings', icon: BarChart3, color: colors.adminWarning },
  ]

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Reports & Analytics
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Comprehensive business intelligence and performance reports for your fleet management
            </p>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((action, index) => (
              <button
                key={action.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: action.color }}
              >
                <action.icon size={18} />
                {action.label}
              </button>
            ))}
          </div>
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

        {/* Available Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
            Available Reports
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                <DashboardCard className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={report.href} className="block h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${report.color}20` }}
                      >
                        <report.icon size={24} style={{ color: report.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-opacity-80 transition-all" style={{ color: colors.textPrimary }}>
                          {report.title}
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                      {Object.entries(report.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold" style={{ color: report.color }}>
                            {value}
                          </div>
                          <div className="text-xs capitalize" style={{ color: colors.textTertiary }}>
                            {key}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: colors.textTertiary }}>
                        Updated {report.lastUpdated}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium group-hover:translate-x-1 transition-transform" style={{ color: report.color }}>
                        <Eye size={16} />
                        View Report
                      </div>
                    </div>
                  </Link>
                </DashboardCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <DashboardCard title="Recent Report Activity" subtitle="Latest report generations and updates">
            <div className="space-y-4">
              {[
                { action: 'Monthly Revenue Report generated', time: '2 hours ago', user: 'Admin', type: 'success' },
                { action: 'Expense Breakdown updated', time: '4 hours ago', user: 'Manager', type: 'info' },
                { action: 'Vehicle Utilization Analysis exported', time: '6 hours ago', user: 'Admin', type: 'success' },
                { action: 'Weekly summary report sent', time: '1 day ago', user: 'System', type: 'info' },
                { action: 'Quarterly report scheduled', time: '2 days ago', user: 'Admin', type: 'warning' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
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
                    <div>
                      <span className="font-medium" style={{ color: colors.textPrimary }}>
                        {activity.action}
                      </span>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        by {activity.user}
                      </div>
                    </div>
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