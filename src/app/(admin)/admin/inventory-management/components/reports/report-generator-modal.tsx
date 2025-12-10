'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  Users,
  Activity,
  Loader2
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventoryReport,
  fetchStockValueReport,
  fetchVehicleUtilizationReport,
  fetchPartsConsumptionReport,
  fetchInventoryTurnoverReport,
  fetchSupplierPerformanceReport,
  exportReportToPDF,
  exportReportToExcel,
} from '@/lib/api'

interface ReportGeneratorModalProps {
  reportType: string
  initialDateRange: { start_date: string; end_date: string }
  onClose: () => void
}

export default function ReportGeneratorModal({
  reportType,
  initialDateRange,
  onClose
}: ReportGeneratorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [exporting, setExporting] = useState<string | null>(null)

  const [filters, setFilters] = useState({
    start_date: initialDateRange.start_date,
    end_date: initialDateRange.end_date,
    format: 'detailed' as 'summary' | 'detailed',
    include_charts: true,
    include_analysis: true,
  })

  const reportConfigs = {
    'inventory': {
      title: 'Inventory Report',
      description: 'Complete inventory status with stock levels and valuations',
      icon: Package,
      color: colors.adminPrimary,
      fetchFunction: fetchInventoryReport
    },
    'stock-value': {
      title: 'Stock Value Analysis',
      description: 'Stock value breakdown by categories and locations',
      icon: TrendingUp,
      color: colors.adminSuccess,
      fetchFunction: fetchStockValueReport
    },
    'vehicle-utilization': {
      title: 'Vehicle Utilization Report',
      description: 'Vehicle usage patterns and contract performance',
      icon: Activity,
      color: colors.supervisorPrimary,
      fetchFunction: fetchVehicleUtilizationReport
    },
    'parts-consumption': {
      title: 'Parts Consumption Report',
      description: 'Parts usage patterns and consumption analysis',
      icon: PieChart,
      color: colors.adminWarning,
      fetchFunction: fetchPartsConsumptionReport
    },
    'inventory-turnover': {
      title: 'Inventory Turnover Report',
      description: 'Inventory movement and turnover analysis',
      icon: BarChart3,
      color: colors.supervisorSecondary,
      fetchFunction: fetchInventoryTurnoverReport
    },
    'supplier-performance': {
      title: 'Supplier Performance Report',
      description: 'Supplier delivery and quality performance metrics',
      icon: Users,
      color: colors.adminAccent,
      fetchFunction: fetchSupplierPerformanceReport
    },
  }

  const config = reportConfigs[reportType as keyof typeof reportConfigs]

  useEffect(() => {
    generateReport()
  }, [reportType, filters.start_date, filters.end_date])

  const generateReport = async () => {
    if (!config) return

    try {
      setLoading(true)
      setError(null)

      const data = await config.fetchFunction({
        start_date: filters.start_date,
        end_date: filters.end_date,
      })

      setReportData(data)
    } catch (err) {
      console.error('Error generating report:', err)
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!reportData || !config) return

    try {
      setExporting(format)

      const exportData = {
        type: reportType,
        data: reportData,
        filters,
        generated_at: new Date().toISOString(),
      }

      let blob: Blob
      let filename: string

      if (format === 'pdf') {
        blob = await exportReportToPDF(exportData)
        filename = `${reportType}-report-${filters.start_date}-to-${filters.end_date}.pdf`
      } else {
        blob = await exportReportToExcel(exportData)
        filename = `${reportType}-report-${filters.start_date}-to-${filters.end_date}.xlsx`
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(`Error exporting report as ${format}:`, err)
      setError(`Failed to export report as ${format.toUpperCase()}`)
    } finally {
      setExporting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">Unknown report type: {reportType}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    )
  }

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 content-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon size={24} style={{ color: config.color }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                {config.title}
              </h2>
              <p style={{ color: colors.textSecondary }}>
                {config.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Filters */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Filter size={16} />
              Report Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Format
                </label>
                <select
                  value={filters.format}
                  onChange={(e) => handleFilterChange('format', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.borderLight }}
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.include_charts}
                    onChange={(e) => handleFilterChange('include_charts', e.target.checked)}
                    className="rounded"
                  />
                  Include Charts
                </label>
                <label className="flex items-center gap-2 text-sm mt-2">
                  <input
                    type="checkbox"
                    checked={filters.include_analysis}
                    onChange={(e) => handleFilterChange('include_analysis', e.target.checked)}
                    className="rounded"
                  />
                  Include Analysis
                </label>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Calendar size={16} />
              Report Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p style={{ color: colors.textSecondary }}>Report Period</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {formatDate(filters.start_date)} - {formatDate(filters.end_date)}
                </p>
              </div>
              <div>
                <p style={{ color: colors.textSecondary }}>Report Type</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {config.title}
                </p>
              </div>
              <div>
                <p style={{ color: colors.textSecondary }}>Generated</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <FileText size={16} />
              Report Preview
            </h3>
            <div className="border rounded-lg p-6 min-h-[300px]" style={{ borderColor: colors.borderLight, backgroundColor: colors.surfaceVariant }}>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: config.color }} />
                    <p style={{ color: colors.textSecondary }}>Generating report...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <FileText size={48} className="mx-auto mb-4 text-red-400" />
                    <p className="text-red-600 mb-2">Failed to generate report</p>
                    <p className="text-sm text-red-500">{error}</p>
                    <button
                      onClick={generateReport}
                      className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : reportData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600 font-medium">Report generated successfully</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportType === 'inventory' && reportData.total_items && (
                      <>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            {reportData.total_items.toLocaleString()}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Total Items</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            KSh {parseFloat(reportData.total_value || '0').toLocaleString()}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Total Value</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold text-orange-600">
                            {reportData.low_stock_items || 0}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Low Stock</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold text-red-600">
                            {reportData.out_of_stock_items || 0}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Out of Stock</p>
                        </div>
                      </>
                    )}

                    {reportType === 'vehicle-utilization' && reportData.summary && (
                      <>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            {reportData.summary.total_vehicles}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Vehicles</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            {reportData.summary.total_contracts}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Contracts</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            KSh {reportData.summary.total_revenue.toLocaleString()}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Revenue</p>
                        </div>
                        <div className="text-center p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                          <p className="text-2xl font-bold" style={{ color: config.color }}>
                            {reportData.summary.avg_utilization.toFixed(1)}%
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>Utilization</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> This is a preview of the report data.
                      Export to PDF or Excel to get the complete formatted report with charts and detailed analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <div>
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <p style={{ color: colors.textSecondary }}>No data available for the selected period</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Export Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderLight }}
            >
              Close
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={!reportData || exporting === 'excel'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors.adminSuccess }}
            >
              {exporting === 'excel' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={!reportData || exporting === 'pdf'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: config.color }}
            >
              {exporting === 'pdf' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              Export PDF
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}