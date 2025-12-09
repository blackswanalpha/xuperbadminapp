'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Car,
  Wrench,
  Activity,
  DollarSign,
  TrendingDown,
  Clock,
} from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventoryDashboard,
  fetchLowStockParts,
  fetchInventoryReports,
} from '@/lib/api'
import {
  InventoryDashboardMetrics,
  Part,
  InventoryReports,
} from '@/types/inventory-api'

export default function OverviewTab() {
  const [metrics, setMetrics] = useState<InventoryDashboardMetrics | null>(null)
  const [lowStockParts, setLowStockParts] = useState<Part[]>([])
  const [reports, setReports] = useState<InventoryReports | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [metricsData, lowStockData, reportsData] = await Promise.all([
        fetchInventoryDashboard(),
        fetchLowStockParts(),
        fetchInventoryReports(),
      ])

      setMetrics(metricsData)
      setLowStockParts(lowStockData)
      setReports(reportsData)
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Failed to load dashboard data')
      
      // Set fallback data for development
      setMetrics({
        total_vehicles: 0,
        available_vehicles: 0,
        hired_vehicles: 0,
        in_garage_vehicles: 0,
        active_rentals: 0,
        utilization_rate: 0,
        total_parts: 0,
        low_stock_alerts: 0,
        total_stock_value: 0,
        monthly_expenses: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const vehicleStats = [
    {
      title: 'Total Vehicles',
      value: metrics?.total_vehicles?.toString() || '0',
      icon: Car,
      trend: { value: '+2', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Available',
      value: metrics?.available_vehicles?.toString() || '0',
      icon: CheckCircle,
      trend: { value: '+1', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Currently Hired',
      value: metrics?.hired_vehicles?.toString() || '0',
      icon: TrendingUp,
      trend: { value: `${metrics?.utilization_rate || 0}%`, isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'In Garage',
      value: metrics?.in_garage_vehicles?.toString() || '0',
      icon: Wrench,
      trend: { value: '-1', isPositive: true },
      color: colors.adminWarning,
    },
  ]

  const inventoryStats = [
    {
      title: 'Total Parts',
      value: metrics?.total_parts?.toString() || '0',
      icon: Package,
      trend: { value: '+12', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.low_stock_alerts?.toString() || '0',
      icon: AlertTriangle,
      trend: { value: '+3', isPositive: false },
      color: colors.adminError,
    },
    {
      title: 'Stock Value',
      value: `KSh ${(metrics?.total_stock_value || 0).toLocaleString()}`,
      icon: DollarSign,
      trend: { value: '+5.2%', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Monthly Expenses',
      value: `KSh ${(metrics?.monthly_expenses || 0).toLocaleString()}`,
      icon: TrendingDown,
      trend: { value: '-8.1%', isPositive: true },
      color: colors.adminWarning,
    },
  ]

  const quickActions = [
    {
      title: 'Add Vehicle',
      description: 'Register new vehicle to inventory',
      icon: Plus,
      color: colors.adminPrimary,
      action: () => {
        // Navigate to add vehicle
        window.location.href = '/admin/vehicle-management'
      },
    },
    {
      title: 'Add Part',
      description: 'Add new part to inventory',
      icon: Wrench,
      color: colors.adminSuccess,
      action: () => {
        // This will be handled by the parts tab
        console.log('Add part')
      },
    },
    {
      title: 'Stock Adjustment',
      description: 'Adjust stock levels',
      icon: Activity,
      color: colors.adminWarning,
      action: () => {
        // This will be handled by the stock usage tab
        console.log('Stock adjustment')
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Vehicle Statistics */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Vehicle Fleet Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicleStats.map((stat, index) => (
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
      </section>

      {/* Inventory Statistics */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Parts Inventory Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventoryStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <DashboardCard
            title="Quick Actions"
            subtitle="Common inventory operations"
          >
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                  style={{ borderColor: colors.borderLight }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${action.color}20` }}
                    >
                      <action.icon size={20} style={{ color: action.color }} />
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                        {action.title}
                      </h4>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <DashboardCard
            title="Low Stock Alerts"
            subtitle={`${lowStockParts.length} items need attention`}
          >
            <div className="space-y-3">
              {lowStockParts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
                  <p style={{ color: colors.textSecondary }}>
                    All parts are well stocked
                  </p>
                </div>
              ) : (
                lowStockParts.slice(0, 5).map((part) => (
                  <div
                    key={part.id}
                    className="p-3 rounded-lg border border-red-200 bg-red-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">
                          {part.name}
                        </h4>
                        <p className="text-sm text-red-600">
                          Stock: {part.current_stock} / Min: {part.min_stock_level}
                        </p>
                      </div>
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>
                  </div>
                ))
              )}
              {lowStockParts.length > 5 && (
                <p className="text-center text-sm" style={{ color: colors.textSecondary }}>
                  +{lowStockParts.length - 5} more items need attention
                </p>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <DashboardCard
            title="Recent Activities"
            subtitle="Latest inventory transactions"
          >
            <div className="space-y-3">
              {/* Mock recent activities - these would come from API */}
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                    <Plus size={16} style={{ color: colors.adminSuccess }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      Stock Adjustment
                    </h4>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Engine Oil +50L • 2 hours ago
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <Car size={16} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      Vehicle Added
                    </h4>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      KCA 456X registered • 5 hours ago
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}20` }}>
                    <Activity size={16} style={{ color: colors.adminWarning }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      Part Usage
                    </h4>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      Brake Pads used on KCA 123A • 1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </div>
    </div>
  )
}