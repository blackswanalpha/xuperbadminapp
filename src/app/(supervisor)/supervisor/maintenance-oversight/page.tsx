'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench,
  Calendar,
  DollarSign,
  Activity,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchMaintenanceRecords, MaintenanceRecord } from '@/lib/api'

export default function MaintenanceOversightPage() {
  const [loading, setLoading] = useState(true)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadMaintenanceData()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchQuery, statusFilter, typeFilter, maintenanceRecords])

  const loadMaintenanceData = async () => {
    try {
      setLoading(true)
      const data = await fetchMaintenanceRecords()
      setMaintenanceRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error('Error loading maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = [...maintenanceRecords]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.maintenance_type === typeFilter)
    }

    setFilteredRecords(filtered)
  }

  // Calculate statistics
  const totalMaintenance = maintenanceRecords.length
  const activeRepairs = maintenanceRecords.filter(r => r.status === 'in_progress').length
  const scheduledService = maintenanceRecords.filter(r => r.status === 'scheduled').length
  const completedToday = maintenanceRecords.filter(r => {
    const today = new Date().toDateString()
    return r.completed_date && new Date(r.completed_date).toDateString() === today
  }).length

  const stats = [
    {
      title: 'Total Maintenance',
      value: totalMaintenance.toString(),
      icon: Wrench,
      trend: { value: `+${completedToday}`, isPositive: true },
      color: colors.supervisorPrimary,
    },
    {
      title: 'Active Repairs',
      value: activeRepairs.toString(),
      icon: Activity,
      trend: { value: '0', isPositive: true },
      color: colors.supervisorAccent,
    },
    {
      title: 'Scheduled Service',
      value: scheduledService.toString(),
      icon: Calendar,
      trend: { value: '0', isPositive: true },
      color: colors.supervisorPrimaryLight,
    },
    {
      title: 'Completed Today',
      value: completedToday.toString(),
      icon: DollarSign,
      trend: { value: '0', isPositive: true },
      color: colors.supervisorSecondary,
    },
  ]

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'routine':
        return 'bg-purple-100 text-purple-800'
      case 'repair':
        return 'bg-orange-100 text-orange-800'
      case 'inspection':
        return 'bg-cyan-100 text-cyan-800'
      case 'insurance':
        return 'bg-indigo-100 text-indigo-800'
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
          Maintenance Oversight
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Monitor and manage all vehicle maintenance activities
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

      {/* Filters Section */}
      <DashboardCard title="Maintenance Records" subtitle="All maintenance activities">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Types</option>
              <option value="routine">Routine Service</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="insurance">Insurance Renewal</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Maintenance Records Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading maintenance records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No maintenance records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Scheduled Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium">Vehicle #{record.vehicle}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(record.maintenance_type)}`}>
                        {record.maintenance_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-800 max-w-xs truncate">{record.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(record.status)}`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(record.scheduled_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-800">
                        KES {parseFloat(record.cost).toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </motion.div>
  )
}
