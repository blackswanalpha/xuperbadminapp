'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wrench,
  Package,
  ClipboardList,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Car,
  BarChart3
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import { fetchJobCards, fetchEquipmentList, Equipment } from '@/lib/api'

interface JobCard {
  id: string
  vehicle_registration: string
  vehicle_make_model: string
  customer_name: string
  issue_description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigned_mechanic?: string
  estimated_cost: number
  actual_cost?: number
  date_created: string
  date_completed?: string
  estimated_completion?: string
}

export default function GarageManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'job-cards' | 'equipment' | 'reports'>('overview')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [error, setError] = useState<string | null>(null)

  // State for data from API
  const [jobCards, setJobCards] = useState<any[]>([])
  const [equipment, setEquipment] = useState<any[]>([])

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [jobCardsData, equipmentData] = await Promise.all([
          fetchJobCards(),
          fetchEquipmentList()
        ])
        setJobCards(jobCardsData)
        setEquipment(equipmentData)
      } catch (error) {
        console.error('Error loading garage management data:', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const garageStats = [
    {
      title: 'Active Job Cards',
      value: (Array.isArray(jobCards) ? jobCards.filter(jc => ['PENDING', 'IN_PROGRESS', 'pending', 'in_progress'].includes(jc.status)).length : 0).toString(),
      icon: ClipboardList,
      trend: { value: '+3', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Completed Today',
      value: (Array.isArray(jobCards) ? jobCards.filter(jc => jc.status?.toLowerCase() === 'completed' && jc.date_completed === new Date().toISOString().split('T')[0]).length : 0).toString(),
      icon: CheckCircle,
      trend: { value: '+2', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Available Equipment',
      value: (Array.isArray(equipment) ? equipment.filter(eq => eq.status === 'AVAILABLE').length : 0).toString(),
      icon: Wrench,
      trend: { value: '0', isPositive: true },
      color: colors.adminAccent,
    },
    {
      title: 'Revenue This Month',
      value: 'KSh 245,000',
      icon: BarChart3,
      trend: { value: '+12%', isPositive: true },
      color: colors.adminPrimary,
    },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'job-cards', label: 'Job Cards', icon: ClipboardList },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ] as const

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return colors.adminSuccess
      case 'IN_PROGRESS':
        return colors.adminPrimary
      case 'PENDING':
        return colors.adminWarning
      case 'ON_HOLD':
        return colors.adminError
      case 'AVAILABLE':
        return colors.adminSuccess
      case 'IN_USE':
        return colors.adminPrimary
      case 'MAINTENANCE':
        return colors.adminWarning
      case 'OUT_OF_ORDER':
        return colors.adminError
      default:
        return colors.textSecondary
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return colors.adminError
      case 'HIGH':
        return colors.adminWarning
      case 'MEDIUM':
        return colors.adminAccent
      case 'LOW':
        return colors.adminSuccess
      default:
        return colors.textSecondary
    }
  }

  const filteredJobCards = Array.isArray(jobCards) ? jobCards.filter(jobCard => {
    const matchesSearch = searchTerm === '' ||
      jobCard.vehicle_registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.issue_description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || jobCard.status === statusFilter

    return matchesSearch && matchesStatus
  }) : []

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderColor: colors.adminPrimary }}></div>
        <p style={{ color: colors.textSecondary }}>Loading garage management data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg mb-4" style={{ color: colors.adminError }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          Retry
        </button>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {/* Navigate to create job card */ }}
          className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="flex items-center gap-3">
            <Plus size={24} style={{ color: colors.adminPrimary }} />
            <div className="text-left">
              <div className="font-medium" style={{ color: colors.textPrimary }}>Create Job Card</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Add new repair job</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => {/* Navigate to add equipment */ }}
          className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="flex items-center gap-3">
            <Wrench size={24} style={{ color: colors.adminAccent }} />
            <div className="text-left">
              <div className="font-medium" style={{ color: colors.textPrimary }}>Add Equipment</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Register new tool</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className="p-4 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors"
          style={{ borderColor: colors.borderLight }}
        >
          <div className="flex items-center gap-3">
            <BarChart3 size={24} style={{ color: colors.adminSuccess }} />
            <div className="text-left">
              <div className="font-medium" style={{ color: colors.textPrimary }}>View Reports</div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Garage analytics</div>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Job Cards */}
      <DashboardCard
        title="Recent Job Cards"
        subtitle="Latest repair jobs"
        action={
          <button
            onClick={() => setActiveTab('job-cards')}
            className="text-sm hover:underline"
            style={{ color: colors.adminPrimary }}
          >
            View All
          </button>
        }
      >
        <div className="space-y-4">
          {jobCards.slice(0, 5).map(jobCard => (
            <div
              key={jobCard.id}
              className="p-4 rounded-lg border"
              style={{ borderColor: colors.borderLight }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium" style={{ color: colors.textPrimary }}>
                    {jobCard.job_card_number || `JC-${String(jobCard.id).padStart(3, '0')}`} - {jobCard.vehicle_registration}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    {jobCard.vehicle_make_model} | {jobCard.customer_name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getPriorityColor(jobCard.priority)}20`,
                      color: getPriorityColor(jobCard.priority)
                    }}
                  >
                    {jobCard.priority}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(jobCard.status)}20`,
                      color: getStatusColor(jobCard.status)
                    }}
                  >
                    {jobCard.status}
                  </span>
                </div>
              </div>
              <p className="text-sm mb-2" style={{ color: colors.textSecondary }}>
                {jobCard.issue_description}
              </p>
              <div className="flex justify-between items-center text-xs" style={{ color: colors.textTertiary }}>
                <span>Created: {jobCard.date_created}</span>
                <span>Est. Cost: KSh {jobCard.estimated_cost.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  )

  const renderJobCards = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: colors.textTertiary }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search job cards..."
            className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm w-64"
            style={{ borderColor: colors.borderLight }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
          style={{ borderColor: colors.borderLight }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
        </select>

        <button
          onClick={() => window.location.href = '/admin/garage-management/job-card/add'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={16} />
          New Job Card
        </button>
      </div>

      {/* Job Cards Table */}
      <DashboardCard
        title={`Job Cards (${filteredJobCards.length})`}
        subtitle="Manage all garage repair jobs"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Job Card
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Vehicle
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Issue
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Cost
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJobCards.map((jobCard, index) => (
                <motion.tr
                  key={jobCard.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.borderLight }}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {jobCard.job_card_number || `JC-${String(jobCard.id).padStart(3, '0')}`}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {jobCard.date_created}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {jobCard.vehicle_registration}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {jobCard.vehicle_make_model}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                    {jobCard.customer_name}
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="text-sm truncate" style={{ color: colors.textSecondary }}>
                        {jobCard.issue_description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium w-fit"
                        style={{
                          backgroundColor: `${getStatusColor(jobCard.status)}20`,
                          color: getStatusColor(jobCard.status)
                        }}
                      >
                        {jobCard.status}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium w-fit"
                        style={{
                          backgroundColor: `${getPriorityColor(jobCard.priority)}20`,
                          color: getPriorityColor(jobCard.priority)
                        }}
                      >
                        {jobCard.priority}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Est: KSh {jobCard.estimated_cost.toLocaleString()}
                      </div>
                      {jobCard.actual_cost && (
                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                          Act: KSh {jobCard.actual_cost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.location.href = `/admin/garage-management/job-card/${jobCard.id}`}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                        title="View Details"
                      >
                        <ClipboardList size={16} style={{ color: colors.adminPrimary }} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  )

  const renderEquipment = () => (
    <DashboardCard
      title="Garage Equipment"
      subtitle="Manage tools and machinery"
      action={
        <button
          onClick={() => {/* Add equipment */ }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={16} />
          Add Equipment
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="p-4 rounded-lg border"
            style={{ borderColor: colors.borderLight }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium" style={{ color: colors.textPrimary }}>{item.name}</h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{item.description || item.condition || 'N/A'}</p>
              </div>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${getStatusColor(item.status)}20`,
                  color: getStatusColor(item.status)
                }}
              >
                {item.status}
              </span>
            </div>
            {item.serial_number && (
              <div className="text-xs" style={{ color: colors.textTertiary }}>
                Serial: {item.serial_number}
              </div>
            )}
            {item.purchase_date && (
              <div className="text-xs" style={{ color: colors.textTertiary }}>
                Purchased: {item.purchase_date}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </DashboardCard>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <DashboardCard
        title="Garage Performance Reports"
        subtitle="Analytics and insights"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}05` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.textPrimary }}>Jobs Completed This Week</h3>
            <div className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>12</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>+20% from last week</div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}05` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.textPrimary }}>Average Completion Time</h3>
            <div className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>2.5 days</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>-0.3 days improvement</div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}05` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.textPrimary }}>Customer Satisfaction</h3>
            <div className="text-2xl font-bold" style={{ color: colors.adminAccent }}>4.6/5</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>Based on 28 reviews</div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Garage Management
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Manage repair jobs, equipment, and garage operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {garageStats.map((stat, index) => (
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

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
              ? 'bg-white shadow-sm'
              : 'hover:bg-gray-200'
              }`}
            style={{
              color: activeTab === tab.id ? colors.adminPrimary : colors.textSecondary
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'job-cards' && renderJobCards()}
        {activeTab === 'equipment' && renderEquipment()}
        {activeTab === 'reports' && renderReports()}
      </motion.div>
    </motion.div>
  )
}