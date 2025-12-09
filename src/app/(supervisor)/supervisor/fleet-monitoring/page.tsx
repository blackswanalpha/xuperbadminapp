'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Car,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  AlertCircle
} from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchInventoryItems, InventoryItem } from '@/lib/api'

export default function FleetMonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('all')

  useEffect(() => {
    loadFleetData()
  }, [])

  useEffect(() => {
    filterItems()
  }, [searchQuery, conditionFilter, inventoryItems])

  const loadFleetData = async () => {
    try {
      setLoading(true)
      const response = await fetchInventoryItems()
      const items = response.results || []
      setInventoryItems(items)
      setFilteredItems(items)
    } catch (error) {
      console.error('Error loading fleet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = [...inventoryItems]

    // Filter by search query (search by vehicle ID or location)
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.vehicle?.toString().includes(searchQuery) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by condition
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(item => item.condition === conditionFilter)
    }

    setFilteredItems(filtered)
  }

  // Calculate statistics
  const totalFleet = inventoryItems.length
  const goodCondition = inventoryItems.filter(item =>
    item.condition === 'EXCELLENT' || item.condition === 'GOOD'
  ).length
  const needsAttention = inventoryItems.filter(item =>
    item.condition === 'FAIR' || item.condition === 'POOR'
  ).length
  const totalValue = inventoryItems.reduce((sum, item) =>
    sum + (parseFloat(item.current_value || '0')), 0
  )

  const stats = [
    {
      title: 'Total Fleet Size',
      value: totalFleet.toString(),
      icon: Car,
      trend: { value: '0', isPositive: true },
      color: colors.supervisorPrimary,
    },
    {
      title: 'Good Condition',
      value: goodCondition.toString(),
      icon: Car,
      trend: { value: `${Math.round((goodCondition / totalFleet) * 100)}%`, isPositive: true },
      color: colors.supervisorAccent,
    },
    {
      title: 'Needs Attention',
      value: needsAttention.toString(),
      icon: AlertCircle,
      trend: { value: `${Math.round((needsAttention / totalFleet) * 100)}%`, isPositive: false },
      color: colors.adminError,
    },
    {
      title: 'Total Fleet Value',
      value: `KES ${(totalValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      trend: { value: '0', isPositive: true },
      color: colors.supervisorSecondary,
    },
  ]

  const getConditionBadgeColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800'
      case 'GOOD':
        return 'bg-blue-100 text-blue-800'
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-800'
      case 'POOR':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Fleet Monitoring
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Monitor vehicle inventory, conditions, and locations
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

      {/* Fleet Inventory Table */}
      <DashboardCard title="Fleet Inventory" subtitle="All vehicles in the system">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by vehicle ID or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Condition Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Conditions</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Fleet Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fleet data...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Car size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No vehicles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <Link key={item.vehicle} href={`/supervisor/fleet-monitoring/${item.vehicle}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Vehicle Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: colors.supervisorPrimaryLight }}
                      >
                        <Car size={20} style={{ color: colors.supervisorPrimary }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Vehicle #{item.vehicle}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {item.vehicle}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-600">{item.location || 'Location not set'}</span>
                    </div>

                    {/* Last Inspection */}
                    {item.last_inspection && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          Last: {new Date(item.last_inspection).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Next Inspection */}
                    {item.next_inspection && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          Next: {new Date(item.next_inspection).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Current Value */}
                    {item.current_value && (
                      <div className="flex items-center gap-2 text-sm pt-3 border-t border-gray-100">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-800">
                          KES {parseFloat(item.current_value).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </DashboardCard>
    </motion.div>
  )
}
