'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calendar, FileText, Download, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import RevenueChart from '@/components/shared/revenue-chart'
import { colors } from '@/lib/theme/colors'

export default function MonthlyRevenueReportPage() {
  const stats = [
    {
      title: 'Monthly Revenue',
      value: 'KSh 450K',
      icon: DollarSign,
      trend: { value: '+12.5%', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Growth Rate',
      value: '15.2%',
      icon: TrendingUp,
      trend: { value: '+3.1%', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Total Contracts',
      value: '24',
      icon: FileText,
      trend: { value: '+2', isPositive: true },
      color: colors.adminAccent,
    },
    {
      title: 'Avg Per Contract',
      value: 'KSh 18.8K',
      icon: Calendar,
      trend: { value: '+5.2%', isPositive: true },
      color: colors.adminWarning,
    },
  ]

  // Monthly revenue data
  const monthlyData = [
    { month: 'Jan', revenue: 380000, contracts: 18 },
    { month: 'Feb', revenue: 420000, contracts: 20 },
    { month: 'Mar', revenue: 350000, contracts: 16 },
    { month: 'Apr', revenue: 480000, contracts: 22 },
    { month: 'May', revenue: 520000, contracts: 25 },
    { month: 'Jun', revenue: 450000, contracts: 24 },
  ]

  // Top revenue sources
  const topSources = [
    { source: 'Vehicle Rentals', amount: 320000, percentage: 71 },
    { source: 'Contract Extensions', amount: 85000, percentage: 19 },
    { source: 'Additional Services', amount: 30000, percentage: 7 },
    { source: 'Late Fees', amount: 15000, percentage: 3 },
  ]

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderLight }}
            >
              <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Monthly Revenue Report
              </h1>
              <p style={{ color: colors.textSecondary }}>
                Detailed analysis of monthly revenue performance and trends
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Download size={20} />
            Export Report
          </button>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <DashboardCard title="Revenue Trend" subtitle="Last 6 months">
              <RevenueChart 
                data={monthlyData.map(item => ({ day: item.month, revenue: item.revenue }))} 
                height={300} 
              />
            </DashboardCard>
          </motion.div>

          {/* Revenue Sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <DashboardCard title="Revenue Sources" subtitle="Breakdown by category">
              <div className="space-y-4">
                {topSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium" style={{ color: colors.textPrimary }}>
                          {source.source}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          KSh {(source.amount / 1000).toFixed(0)}K
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${source.percentage}%`,
                            backgroundColor: colors.adminPrimary,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs" style={{ color: colors.textTertiary }}>
                          {source.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </motion.div>
        </div>

        {/* Monthly Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <DashboardCard title="Monthly Breakdown" subtitle="Detailed monthly performance">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Month
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Revenue
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Contracts
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Avg per Contract
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, index) => {
                    const avgPerContract = data.revenue / data.contracts
                    const prevRevenue = index > 0 ? monthlyData[index - 1].revenue : data.revenue
                    const growth = index > 0 ? ((data.revenue - prevRevenue) / prevRevenue * 100) : 0

                    return (
                      <motion.tr
                        key={data.month}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.borderLight }}
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                          {data.month} 2024
                        </td>
                        <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                          KSh {(data.revenue / 1000).toFixed(0)}K
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          {data.contracts}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          KSh {(avgPerContract / 1000).toFixed(1)}K
                        </td>
                        <td className="py-3 px-4">
                          {index > 0 && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    
  )
}