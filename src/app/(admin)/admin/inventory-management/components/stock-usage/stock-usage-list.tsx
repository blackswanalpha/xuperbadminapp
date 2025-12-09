'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Package, 
  User, 
  TrendingDown,
  TrendingUp,
  Eye
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import DashboardCard from '@/components/shared/dashboard-card'
import {
  fetchStockUsage,
  fetchStockUsageStats,
} from '@/lib/api'
import {
  StockUsage,
  StockUsageStats,
} from '@/types/inventory-api'

interface StockUsageListProps {
  onAdd: () => void
  onView: (usage: StockUsage) => void
  refreshTrigger: number
}

export default function StockUsageList({ onAdd, onView, refreshTrigger }: StockUsageListProps) {
  const [stockUsage, setStockUsage] = useState<StockUsage[]>([])
  const [stats, setStats] = useState<StockUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('all')

  useEffect(() => {
    loadStockUsageData()
  }, [refreshTrigger])

  const loadStockUsageData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usageResponse, statsResponse] = await Promise.all([
        fetchStockUsage(),
        fetchStockUsageStats(),
      ])

      setStockUsage(usageResponse.results)
      setStats(statsResponse)
    } catch (err) {
      console.error('Error loading stock usage data:', err)
      setError('Failed to load stock usage data')
    } finally {
      setLoading(false)
    }
  }

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return <Package size={16} className="text-blue-600" />
      case 'SALE':
        return <TrendingDown size={16} className="text-green-600" />
      case 'INTERNAL':
        return <User size={16} className="text-purple-600" />
      case 'DAMAGE':
        return <TrendingDown size={16} className="text-red-600" />
      default:
        return <Package size={16} className="text-gray-600" />
    }
  }

  const getUsageTypeColor = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'bg-blue-100 text-blue-800'
      case 'SALE':
        return 'bg-green-100 text-green-800'
      case 'INTERNAL':
        return 'bg-purple-100 text-purple-800'
      case 'DAMAGE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsage = stockUsage.filter(usage => {
    const matchesSearch = usage.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usage.part_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usage.used_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usage.reference_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'all' || usage.usage_type === filterType

    let matchesDateRange = true
    if (filterDateRange !== 'all') {
      const usageDate = new Date(usage.used_at)
      const now = new Date()
      
      switch (filterDateRange) {
        case 'today':
          matchesDateRange = usageDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = usageDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDateRange = usageDate >= monthAgo
          break
      }
    }

    return matchesSearch && matchesType && matchesDateRange
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadStockUsageData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Total Usage Records"
            subtitle="All time"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>
                  {stats.total_usage_records?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Usage entries
                </p>
              </div>
              <Package size={32} style={{ color: colors.adminPrimary }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Quantity Used"
            subtitle="All time"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>
                  {stats.total_quantity_used?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Parts consumed
                </p>
              </div>
              <TrendingDown size={32} style={{ color: colors.adminSuccess }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Usage Value"
            subtitle="Cost of consumed parts"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminWarning }}>
                  KSh {parseFloat(stats.total_usage_value || '0').toLocaleString()}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Value consumed
                </p>
              </div>
              <TrendingUp size={32} style={{ color: colors.adminWarning }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent Activity"
            subtitle="This month"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                  {stats.recent_usage_count?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  New records
                </p>
              </div>
              <Calendar size={32} style={{ color: colors.supervisorPrimary }} />
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Main Content */}
      <DashboardCard
        title="Stock Usage Tracking"
        subtitle="Monitor parts consumption and usage patterns"
      >
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by part, SKU, user, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.borderLight }}
              >
                <option value="all">All Types</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SALE">Sale</option>
                <option value="INTERNAL">Internal Use</option>
                <option value="DAMAGE">Damage</option>
              </select>

              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.borderLight }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                <Plus size={16} />
                Record Usage
              </button>
            </div>
          </div>

          {/* Usage List */}
          <div className="overflow-x-auto">
            {filteredUsage.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  No Stock Usage Records
                </h3>
                <p style={{ color: colors.textSecondary }}>
                  {searchTerm || filterType !== 'all' || filterDateRange !== 'all' 
                    ? 'No usage records match your current filters'
                    : 'Start recording stock usage to track consumption patterns'
                  }
                </p>
              </div>
            ) : (
              <div className="min-w-full">
                <div className="grid grid-cols-1 gap-4">
                  {filteredUsage.map((usage) => (
                    <motion.div
                      key={usage.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Part Information */}
                          <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              {getUsageTypeIcon(usage.usage_type)}
                              <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
                                {usage.part_name}
                              </h4>
                            </div>
                            <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                              SKU: {usage.part_sku}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUsageTypeColor(usage.usage_type)}`}
                            >
                              {usage.usage_type}
                            </span>
                          </div>

                          {/* Usage Details */}
                          <div>
                            <div className="flex items-center gap-1 mb-2">
                              <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                                Quantity Used:
                              </p>
                            </div>
                            <p className="text-lg font-semibold" style={{ color: colors.adminPrimary }}>
                              {usage.quantity_used} {usage.unit || 'units'}
                            </p>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              Unit Cost: KSh {parseFloat(usage.unit_cost || '0').toLocaleString()}
                            </p>
                          </div>

                          {/* Usage Info */}
                          <div>
                            <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                              Used by: <span className="font-medium">{usage.used_by || 'N/A'}</span>
                            </p>
                            <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                              Date: {new Date(usage.used_at).toLocaleDateString()}
                            </p>
                            {usage.reference_number && (
                              <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                                Ref: {usage.reference_number}
                              </p>
                            )}
                            <p className="text-sm font-medium" style={{ color: colors.adminSuccess }}>
                              Total: KSh {parseFloat(usage.total_cost || '0').toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => onView(usage)}
                            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: colors.borderLight }}
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: colors.textSecondary }} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}