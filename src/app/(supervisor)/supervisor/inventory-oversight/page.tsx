'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Car,
  Wrench,
  Activity,
  DollarSign,
  TrendingDown,
  Clock,
  Eye,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import VehicleStatusGrid from '@/components/dashboard/VehicleStatusGrid'
import VehicleStatusTimeline from '@/components/dashboard/VehicleStatusTimeline'
import StatusUpdateModal from '@/components/modals/StatusUpdateModal'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventoryDashboard,
  fetchLowStockParts,
  fetchInventoryReports,
  fetchPartsStockSummary,
  fetchInventoryItems,
  fetchParts,
  fetchVehicleStatusOverview,
  InventoryDashboardMetrics,
  Part,
  InventoryReports,
  InventoryItem
} from '@/lib/api'

type Tab = 'overview' | 'vehicles' | 'tracking' | 'parts' | 'reports' | 'alerts'

// Vehicle Tracking Tab Component
function VehicleTrackingTab({ 
  onVehicleSelect,
  onStatusUpdate
}: { 
  onVehicleSelect: (vehicle: any) => void
  onStatusUpdate: () => void
}) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Vehicle Status Grid */}
      <VehicleStatusGrid
        onVehicleSelect={(vehicle) => {
          onVehicleSelect(vehicle)
          setSelectedVehicleId(vehicle.id.toString())
        }}
        onStatusUpdate={onStatusUpdate}
      />
      
      {/* Vehicle Timeline - Show when a vehicle is selected */}
      {selectedVehicleId && (
        <VehicleStatusTimeline
          vehicleId={selectedVehicleId}
          days={30}
          maxEntries={20}
          className="mt-6"
        />
      )}
    </div>
  )
}

export default function InventoryOversightPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<InventoryDashboardMetrics | null>(null)
  const [lowStockParts, setLowStockParts] = useState<Part[]>([])
  const [reports, setReports] = useState<InventoryReports | null>(null)
  const [vehicles, setVehicles] = useState<InventoryItem[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [partsStockSummary, setPartsStockSummary] = useState<any>(null)
  
  // Vehicle tracking state
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [statusOverview, setStatusOverview] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        metricsData,
        lowStockData,
        reportsData,
        vehiclesData,
        partsData,
        stockSummaryData,
        statusOverviewData
      ] = await Promise.all([
        fetchInventoryDashboard(),
        fetchLowStockParts(),
        fetchInventoryReports(),
        fetchInventoryItems(),
        fetchParts(),
        fetchPartsStockSummary(),
        fetchVehicleStatusOverview().catch(() => null) // Optional - might fail if no vehicles
      ])

      setMetrics(metricsData)
      setLowStockParts(lowStockData)
      setReports(reportsData)
      setVehicles(vehiclesData.results || [])
      setParts(partsData.results || [])
      setPartsStockSummary(stockSummaryData)
      setStatusOverview(statusOverviewData)
    } catch (error: any) {
      console.error('Error loading inventory overview:', error)
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message ||
                          error?.message || 
                          'Failed to load inventory data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Vehicle tracking functions
  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdated = () => {
    // Reload status overview after update
    fetchVehicleStatusOverview()
      .then(setStatusOverview)
      .catch(console.error)
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'tracking', label: 'Vehicle Tracking', icon: Activity },
    { id: 'parts', label: 'Parts', icon: Package },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory overview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              <p className="font-medium">Error Loading Inventory Data</p>
            </div>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Inventory Oversight
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Monitor vehicle fleet, parts inventory, and stock levels
        </p>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Vehicles"
            value={vehicles.length.toString()}
            icon={Car}
            trend={{ value: '', isPositive: true }}
            color={colors.supervisorPrimary}
          />
          <StatCard
            title="Total Parts"
            value={parts.length.toString()}
            icon={Package}
            trend={{ value: '', isPositive: true }}
            color={colors.supervisorAccent}
          />
          <StatCard
            title="Low Stock Alerts"
            value={lowStockParts.length.toString()}
            icon={AlertTriangle}
            trend={{ value: '', isPositive: false }}
            color={colors.adminError}
          />
          <StatCard
            title="Stock Value"
            value={`KES ${(partsStockSummary?.total_value || 0).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: '', isPositive: true }}
            color={colors.supervisorSecondary}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {tab.label}
                {tab.id === 'alerts' && lowStockParts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {lowStockParts.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab 
              metrics={metrics} 
              vehicles={vehicles}
              parts={parts}
              lowStockParts={lowStockParts}
              partsStockSummary={partsStockSummary}
              statusOverview={statusOverview}
            />
          )}
          {activeTab === 'vehicles' && <VehiclesTab vehicles={vehicles} />}
          {activeTab === 'tracking' && (
            <VehicleTrackingTab 
              onVehicleSelect={handleVehicleSelect}
              onStatusUpdate={handleStatusUpdated}
            />
          )}
          {activeTab === 'parts' && <PartsTab parts={parts} />}
          {activeTab === 'alerts' && <AlertsTab lowStockParts={lowStockParts} />}
          {activeTab === 'reports' && (
            <ReportsTab 
              reports={reports} 
              vehicles={vehicles} 
              parts={parts} 
              partsStockSummary={partsStockSummary} 
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onStatusUpdated={handleStatusUpdated}
        userRole="supervisor"
      />
    </motion.div>
  )
}

// Overview Tab Component
function OverviewTab({ 
  metrics, 
  vehicles, 
  parts, 
  lowStockParts, 
  partsStockSummary,
  statusOverview 
}: { 
  metrics: InventoryDashboardMetrics | null
  vehicles: InventoryItem[]
  parts: Part[]
  lowStockParts: Part[]
  partsStockSummary: any
  statusOverview: any
}) {
  // Vehicle condition breakdown
  const vehicleConditions = vehicles.reduce((acc, vehicle) => {
    acc[vehicle.condition] = (acc[vehicle.condition] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Parts with low stock
  const criticalStockParts = parts.filter(part => (part.current_stock || 0) <= (part.min_stock_level || 0))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Vehicle Fleet Summary" subtitle="Vehicle condition breakdown">
          <div className="space-y-4">
            {Object.entries(vehicleConditions).map(([condition, count]) => (
              <div key={condition} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    condition === 'EXCELLENT' ? 'bg-green-500' :
                    condition === 'GOOD' ? 'bg-blue-500' :
                    condition === 'FAIR' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm capitalize">{condition.toLowerCase()}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Vehicle Status Overview */}
        {statusOverview && (
          <DashboardCard title="Vehicle Status Overview" subtitle="Real-time status tracking">
            <div className="space-y-4">
              {Object.entries(statusOverview.status_breakdown || {}).map(([status, data]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'AVAILABLE' ? 'bg-green-500' :
                      status === 'HIRED' ? 'bg-blue-500' :
                      status === 'IN_GARAGE' ? 'bg-orange-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm">{data.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{data.count}</span>
                    <span className="text-xs text-gray-500 ml-1">({data.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        <DashboardCard title="Parts Inventory" subtitle="Current stock levels">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Parts</span>
              <span className="font-semibold">{parts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="font-semibold text-orange-600">{lowStockParts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical Stock</span>
              <span className="font-semibold text-red-600">{criticalStockParts.length}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Total Value</span>
              <span className="font-semibold">KES {(partsStockSummary?.total_value || 0).toLocaleString()}</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="/supervisor/fleet-monitoring" className="block">
          <DashboardCard title="Fleet Monitoring" subtitle="View vehicle status">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{vehicles.length}</p>
                <p className="text-sm text-gray-600">Vehicles tracked</p>
              </div>
              <Car size={32} style={{ color: colors.supervisorPrimary }} />
            </div>
          </DashboardCard>
        </Link>

        <Link href="/supervisor/garage/parts" className="block">
          <DashboardCard title="Parts Management" subtitle="Manage stock levels">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{parts.length}</p>
                <p className="text-sm text-gray-600">Parts available</p>
              </div>
              <Package size={32} style={{ color: colors.supervisorAccent }} />
            </div>
          </DashboardCard>
        </Link>

        <Link href="/supervisor/garage/stock-usage" className="block">
          <DashboardCard title="Stock Usage" subtitle="Track consumption">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{lowStockParts.length}</p>
                <p className="text-sm text-gray-600">Need attention</p>
              </div>
              <Activity size={32} style={{ color: colors.adminError }} />
            </div>
          </DashboardCard>
        </Link>
      </div>
    </div>
  )
}

// Vehicles Tab Component
function VehiclesTab({ vehicles }: { vehicles: InventoryItem[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [conditionFilter, setConditionFilter] = useState('all')

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCondition = conditionFilter === 'all' || vehicle.condition === conditionFilter
    return matchesSearch && matchesCondition
  })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800'
      case 'GOOD': return 'bg-blue-100 text-blue-800'
      case 'FAIR': return 'bg-yellow-100 text-yellow-800'
      case 'POOR': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardCard title="Vehicle Inventory" subtitle="All vehicles in the fleet">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Conditions</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="POOR">Poor</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <Link key={vehicle.vehicle} href={`/supervisor/fleet-monitoring/${vehicle.vehicle}`}>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Car size={20} style={{ color: colors.supervisorPrimary }} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {vehicle.registration_number || `Vehicle #${vehicle.vehicle}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(vehicle.condition)}`}>
                    {vehicle.condition}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Location: {vehicle.location || 'Not set'}</p>
                  <p>Category: {vehicle.category || 'N/A'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardCard>
  )
}

// Parts Tab Component
function PartsTab({ parts }: { parts: Part[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const filteredParts = parts.filter(part => {
    const matchesSearch = part.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesStock = true
    if (stockFilter === 'low') {
      matchesStock = (part.current_stock || 0) <= (part.min_stock_level || 0)
    } else if (stockFilter === 'out') {
      matchesStock = (part.current_stock || 0) === 0
    }
    return matchesSearch && matchesStock
  })

  const getStockStatus = (part: Part) => {
    const stock = part.current_stock || 0
    const reorderLevel = part.min_stock_level || 0
    
    if (stock === 0) return { status: 'Out of Stock', color: 'text-red-600' }
    if (stock <= reorderLevel) return { status: 'Low Stock', color: 'text-orange-600' }
    return { status: 'In Stock', color: 'text-green-600' }
  }

  return (
    <DashboardCard title="Parts Inventory" subtitle="All parts in stock">
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search parts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Stock Levels</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* Parts List */}
      {filteredParts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No parts found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Part</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => {
                const stockStatus = getStockStatus(part)
                return (
                  <tr key={part.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{part.name}</p>
                        <p className="text-sm text-gray-500">{part.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{part.sku}</td>
                    <td className="py-3 px-4 text-sm">{part.category_name || 'Uncategorized'}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p className="font-medium">{part.current_stock || 0} {part.unit}</p>
                        <p className="text-gray-500">Reorder at: {part.min_stock_level || 0}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${stockStatus.color}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      KES {parseFloat(part.unit_cost || '0').toLocaleString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}

// Alerts Tab Component
function AlertsTab({ lowStockParts }: { lowStockParts: Part[] }) {
  return (
    <div className="space-y-6">
      <DashboardCard 
        title="Low Stock Alerts" 
        subtitle={`${lowStockParts.length} parts require attention`}
      >
        {lowStockParts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-500">No stock alerts at this time</p>
            <p className="text-sm text-gray-400">All parts are at healthy stock levels</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockParts.map((part) => (
              <div key={part.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-orange-900">{part.name}</h3>
                      <p className="text-sm text-orange-700">
                        SKU: {part.sku} • Category: {part.category_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-900">
                      {part.current_stock || 0} {part.unit} remaining
                    </p>
                    <p className="text-xs text-orange-700">
                      Reorder level: {part.min_stock_level || 0} {part.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}

// Reports Tab Component
function ReportsTab({ 
  reports, 
  vehicles, 
  parts, 
  partsStockSummary 
}: { 
  reports: InventoryReports | null
  vehicles: InventoryItem[]
  parts: Part[]
  partsStockSummary: any
}) {
  const reportCards = [
    {
      title: 'Vehicle Utilization Report',
      description: 'Track vehicle usage patterns and efficiency',
      icon: Car,
      link: '/supervisor/garage/reports'
    },
    {
      title: 'Parts Consumption Report',
      description: 'Monitor parts usage and trends',
      icon: Package,
      link: '/supervisor/garage/reports'
    },
    {
      title: 'Stock Value Report',
      description: 'Current inventory valuation',
      icon: DollarSign,
      link: '/supervisor/garage/reports'
    },
    {
      title: 'Low Stock Alerts Report',
      description: 'Parts requiring immediate attention',
      icon: AlertTriangle,
      link: '/supervisor/garage/reports'
    }
  ]

  return (
    <div className="space-y-6">
      <DashboardCard title="Inventory Reports" subtitle="Generate and view reports">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportCards.map((report, index) => {
            const Icon = report.icon
            return (
              <Link key={index} href={report.link}>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={24} style={{ color: colors.supervisorPrimary }} />
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                    <Eye size={16} />
                    View Report
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </DashboardCard>

      {/* Quick Stats */}
      {reports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Total Items" subtitle="All inventory items">
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-gray-900">
                {reports?.summary?.total_items || vehicles.length + parts.length}
              </p>
              <p className="text-sm text-gray-600">Items tracked</p>
            </div>
          </DashboardCard>

          <DashboardCard title="Total Value" subtitle="Current inventory value">
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-gray-900">
                KES {((reports?.summary?.total_current_value || partsStockSummary?.total_value || 0)).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Current value</p>
            </div>
          </DashboardCard>

          <DashboardCard title="Depreciation" subtitle="Value depreciation">
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-gray-900">
                {reports?.summary?.depreciation_percentage || 0}%
              </p>
              <p className="text-sm text-gray-600">Depreciation rate</p>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  )
}