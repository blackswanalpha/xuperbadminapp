'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Package, 
  Users, 
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import DashboardCard from '@/components/shared/dashboard-card'
import {
  fetchInventoryReport,
  fetchStockValueReport,
  fetchVehicleUtilizationReport,
  fetchPartsConsumptionReport,
  fetchInventoryTurnoverReport,
  fetchSupplierPerformanceReport,
} from '@/lib/api'
import {
  InventoryReport,
  StockValueReport,
  VehicleUtilizationReport,
  PartsConsumptionReport,
  InventoryTurnoverReport,
  SupplierPerformanceReport,
} from '@/types/inventory-api'

interface ReportsDashboardProps {
  onGenerateReport: (reportType: string, dateRange: { start_date: string; end_date: string }) => void
}

export default function ReportsDashboard({ onGenerateReport }: ReportsDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportSummaries, setReportSummaries] = useState<{
    inventory: InventoryReport | null
    stockValue: StockValueReport | null
    vehicleUtilization: VehicleUtilizationReport | null
    partsConsumption: PartsConsumptionReport | null
    inventoryTurnover: InventoryTurnoverReport | null
    supplierPerformance: SupplierPerformanceReport | null
  }>({
    inventory: null,
    stockValue: null,
    vehicleUtilization: null,
    partsConsumption: null,
    inventoryTurnover: null,
    supplierPerformance: null,
  })

  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end_date: new Date().toISOString().split('T')[0], // today
  })

  useEffect(() => {
    loadReportSummaries()
  }, [dateRange])

  const loadReportSummaries = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        inventoryReport,
        stockValueReport,
        vehicleUtilizationReport,
        partsConsumptionReport,
        inventoryTurnoverReport,
        supplierPerformanceReport,
      ] = await Promise.all([
        fetchInventoryReport(dateRange).catch(() => null),
        fetchStockValueReport().catch(() => null),
        fetchVehicleUtilizationReport(dateRange).catch(() => null),
        fetchPartsConsumptionReport(dateRange).catch(() => null),
        fetchInventoryTurnoverReport(dateRange).catch(() => null),
        fetchSupplierPerformanceReport(dateRange).catch(() => null),
      ])

      setReportSummaries({
        inventory: inventoryReport,
        stockValue: stockValueReport,
        vehicleUtilization: vehicleUtilizationReport,
        partsConsumption: partsConsumptionReport,
        inventoryTurnover: inventoryTurnoverReport,
        supplierPerformance: supplierPerformanceReport,
      })
    } catch (err) {
      console.error('Error loading report summaries:', err)
      setError('Failed to load report summaries')
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Complete inventory status with stock levels and valuations',
      icon: Package,
      color: colors.adminPrimary,
      summary: reportSummaries.inventory,
      metrics: reportSummaries.inventory ? [
        { label: 'Total Items', value: reportSummaries.inventory.total_items?.toLocaleString() || '0' },
        { label: 'Total Value', value: `KSh ${parseFloat(reportSummaries.inventory.total_value || '0').toLocaleString()}` },
        { label: 'Low Stock Items', value: reportSummaries.inventory.low_stock_items?.toLocaleString() || '0' },
        { label: 'Out of Stock', value: reportSummaries.inventory.out_of_stock_items?.toLocaleString() || '0' },
      ] : []
    },
    {
      id: 'stock-value',
      title: 'Stock Value Analysis',
      description: 'Stock value breakdown by categories and locations',
      icon: TrendingUp,
      color: colors.adminSuccess,
      summary: reportSummaries.stockValue,
      metrics: reportSummaries.stockValue ? [
        { label: 'Categories', value: reportSummaries.stockValue.categories?.length?.toString() || '0' },
        { label: 'Locations', value: reportSummaries.stockValue.location_breakdown?.length?.toString() || '0' },
      ] : []
    },
    {
      id: 'vehicle-utilization',
      title: 'Vehicle Utilization',
      description: 'Vehicle usage patterns and contract performance',
      icon: Activity,
      color: colors.supervisorPrimary,
      summary: reportSummaries.vehicleUtilization,
      metrics: reportSummaries.vehicleUtilization ? [
        { label: 'Vehicles', value: reportSummaries.vehicleUtilization.summary?.total_vehicles?.toString() || '0' },
        { label: 'Total Contracts', value: reportSummaries.vehicleUtilization.summary?.total_contracts?.toString() || '0' },
        { label: 'Total Revenue', value: `KSh ${reportSummaries.vehicleUtilization.summary?.total_revenue?.toLocaleString() || '0'}` },
        { label: 'Avg Utilization', value: `${reportSummaries.vehicleUtilization.summary?.avg_utilization?.toFixed(1) || '0'}%` },
      ] : []
    },
    {
      id: 'parts-consumption',
      title: 'Parts Consumption',
      description: 'Parts usage patterns and consumption analysis',
      icon: PieChart,
      color: colors.adminWarning,
      summary: reportSummaries.partsConsumption,
      metrics: reportSummaries.partsConsumption ? [
        { label: 'Parts Used', value: reportSummaries.partsConsumption.summary?.total_parts_used?.toString() || '0' },
        { label: 'Total Quantity', value: reportSummaries.partsConsumption.summary?.total_quantity?.toString() || '0' },
        { label: 'Total Cost', value: `KSh ${reportSummaries.partsConsumption.summary?.total_cost?.toLocaleString() || '0'}` },
      ] : []
    },
    {
      id: 'inventory-turnover',
      title: 'Inventory Turnover',
      description: 'Inventory movement and turnover analysis',
      icon: LineChart,
      color: colors.supervisorSecondary,
      summary: reportSummaries.inventoryTurnover,
      metrics: reportSummaries.inventoryTurnover ? [
        { label: 'Avg Turnover', value: `${reportSummaries.inventoryTurnover.average_turnover_rate?.toFixed(2) || '0'}x` },
        { label: 'Fast Moving', value: reportSummaries.inventoryTurnover.fast_moving_items?.toString() || '0' },
        { label: 'Slow Moving', value: reportSummaries.inventoryTurnover.slow_moving_items?.toString() || '0' },
      ] : []
    },
    {
      id: 'supplier-performance',
      title: 'Supplier Performance',
      description: 'Supplier delivery and quality performance metrics',
      icon: Users,
      color: colors.adminAccent,
      summary: reportSummaries.supplierPerformance,
      metrics: reportSummaries.supplierPerformance ? [
        { label: 'Suppliers', value: reportSummaries.supplierPerformance.suppliers?.length?.toString() || '0' },
        { label: 'Avg Rating', value: `${reportSummaries.supplierPerformance.average_rating?.toFixed(1) || '0'}/5` },
        { label: 'On-Time Rate', value: `${reportSummaries.supplierPerformance.average_on_time_rate?.toFixed(1) || '0'}%` },
      ] : []
    },
  ]

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
          onClick={loadReportSummaries}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2" style={{ color: colors.textPrimary }}>
            <FileText size={28} />
            Reports Dashboard
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Generate comprehensive inventory and operational reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={16} style={{ color: colors.textSecondary }} />
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: colors.borderLight }}
          />
          <span style={{ color: colors.textSecondary }}>to</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: colors.borderLight }}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const hasData = report.summary !== null

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <DashboardCard>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${report.color}20` }}
                      >
                        <Icon size={24} style={{ color: report.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                          {report.title}
                        </h3>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {hasData && report.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {report.metrics.map((metric, index) => (
                        <div key={index} className="text-center">
                          <p className="text-lg font-bold" style={{ color: report.color }}>
                            {metric.value}
                          </p>
                          <p className="text-xs" style={{ color: colors.textSecondary }}>
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        {hasData ? 'Data Available' : 'No Data'}
                      </span>
                    </div>
                    <button
                      onClick={() => onGenerateReport(report.id, dateRange)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium hover:opacity-80 transition-opacity group-hover:scale-105"
                      style={{ backgroundColor: report.color, color: 'white' }}
                    >
                      <Download size={12} />
                      Generate
                    </button>
                  </div>
                </div>
              </DashboardCard>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Insights */}
      <DashboardCard
        title="Quick Insights"
        subtitle="Key findings from current data"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-blue-600" />
              <span className="font-medium text-blue-800">Inventory Health</span>
            </div>
            <p className="text-sm text-blue-700">
              {reportSummaries.inventory?.low_stock_items || 0} items need restocking
            </p>
          </div>

          <div className="p-4 rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-600" />
              <span className="font-medium text-green-800">Stock Value</span>
            </div>
            <p className="text-sm text-green-700">
              KSh {parseFloat(reportSummaries.inventory?.total_value || '0').toLocaleString()} total inventory value
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-purple-600" />
              <span className="font-medium text-purple-800">Utilization</span>
            </div>
            <p className="text-sm text-purple-700">
              {reportSummaries.vehicleUtilization?.summary?.avg_utilization?.toFixed(1) || '0'}% average vehicle utilization
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-50">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-orange-600" />
              <span className="font-medium text-orange-800">Supplier Performance</span>
            </div>
            <p className="text-sm text-orange-700">
              {reportSummaries.supplierPerformance?.average_rating?.toFixed(1) || '0'}/5 average supplier rating
            </p>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}