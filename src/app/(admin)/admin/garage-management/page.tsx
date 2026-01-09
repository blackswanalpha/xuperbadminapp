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
  BarChart3,
  Edit,
  Trash,
  X,
  Save
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import {
  fetchJobCards,
  fetchEquipmentList,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  Equipment,
  JobCard
} from '@/lib/api'

export default function GarageManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'job-cards' | 'equipment' | 'reports'>('overview')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [error, setError] = useState<string | null>(null)

  // State for data from API
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  // Equipment CRUD state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    description: '',
    serial_number: '',
    purchase_date: '',
    cost: 0,
    condition: 'GOOD' as Equipment['condition'],
    status: 'AVAILABLE' as Equipment['status'],
    notes: ''
  })
  const [savingEquipment, setSavingEquipment] = useState(false)
  const [showDeleteEquipmentModal, setShowDeleteEquipmentModal] = useState(false)
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null)
  const [deletingEquipment, setDeletingEquipment] = useState(false)

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
        setJobCards(jobCardsData.results || [])
        setEquipment(equipmentData.results || [])
      } catch (error) {
        console.error('Error loading garage management data:', error)
        setError('Failed to load data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate statistics
  const jobsCompletedToday = Array.isArray(jobCards) ? jobCards.filter(jc =>
    jc.status?.toLowerCase() === 'completed' &&
    (jc.date_completed || jc.date_released)?.split('T')[0] === new Date().toISOString().split('T')[0]
  ).length : 0

  const activeJobCardsCount = Array.isArray(jobCards) ? jobCards.filter(jc =>
    ['PENDING', 'IN_PROGRESS', 'pending', 'in_progress'].includes(jc.status)
  ).length : 0

  const availableEquipmentCount = Array.isArray(equipment) ? equipment.filter(eq =>
    eq.status === 'AVAILABLE'
  ).length : 0

  // Calculate weekly stats
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  startOfWeek.setHours(0, 0, 0, 0)

  const jobsCompletedThisWeek = Array.isArray(jobCards) ? jobCards.filter(jc => {
    if (jc.status?.toLowerCase() !== 'completed' || (!jc.date_completed && !jc.date_released)) return false
    const completionDate = new Date(jc.date_completed || jc.date_released!)
    return completionDate >= startOfWeek
  }).length : 0

  // Calculate average completion time
  const completedJobsWithDates = Array.isArray(jobCards) ? jobCards.filter(jc =>
    jc.status?.toLowerCase() === 'completed' && (jc.date_completed || jc.date_released) && jc.date_created
  ) : []

  const totalCompletionTimeMs = completedJobsWithDates.reduce((acc, jc) => {
    const start = new Date(jc.date_created).getTime()
    const end = new Date(jc.date_completed || jc.date_released!).getTime()
    return acc + (end - start)
  }, 0)

  const avgCompletionTimeDays = completedJobsWithDates.length > 0
    ? (totalCompletionTimeMs / completedJobsWithDates.length / (1000 * 60 * 60 * 24)).toFixed(1)
    : '0.0'

  // Calculate Urgent Jobs
  const urgentJobsCount = Array.isArray(jobCards) ? jobCards.filter(jc => jc.priority === 'URGENT').length : 0

  const garageStats = [
    {
      title: 'Active Job Cards',
      value: activeJobCardsCount.toString(),
      icon: ClipboardList,
      color: colors.adminPrimary,
    },
    {
      title: 'Completed Today',
      value: jobsCompletedToday.toString(),
      icon: CheckCircle,
      color: colors.adminSuccess,
    },
    {
      title: 'Available Equipment',
      value: availableEquipmentCount.toString(),
      icon: Wrench,
      color: colors.adminAccent,
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
      jobCard.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.job_card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.model?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || jobCard.status?.toUpperCase() === statusFilter

    return matchesSearch && matchesStatus
  }) : []

  // Equipment CRUD handlers
  const resetEquipmentForm = () => {
    setEquipmentFormData({
      name: '',
      description: '',
      serial_number: '',
      purchase_date: '',
      cost: 0,
      condition: 'GOOD',
      status: 'AVAILABLE',
      notes: ''
    })
    setEditingEquipment(null)
  }

  const openAddEquipmentModal = () => {
    resetEquipmentForm()
    setShowEquipmentModal(true)
  }

  const openEditEquipmentModal = (item: Equipment) => {
    setEditingEquipment(item)
    setEquipmentFormData({
      name: item.name,
      description: item.description || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      cost: item.cost,
      condition: item.condition,
      status: item.status,
      notes: item.notes || ''
    })
    setShowEquipmentModal(true)
  }

  const handleEquipmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEquipmentFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSaveEquipment = async () => {
    if (!equipmentFormData.name.trim()) {
      alert('Equipment name is required')
      return
    }

    setSavingEquipment(true)
    try {
      if (editingEquipment) {
        // Update existing equipment
        const updated = await updateEquipment(editingEquipment.id, equipmentFormData)
        setEquipment(prev => prev.map(e => e.id === editingEquipment.id ? updated : e))
      } else {
        // Create new equipment
        const created = await createEquipment(equipmentFormData)
        setEquipment(prev => [...prev, created])
      }
      setShowEquipmentModal(false)
      resetEquipmentForm()
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('Failed to save equipment. Please try again.')
    } finally {
      setSavingEquipment(false)
    }
  }

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return

    setDeletingEquipment(true)
    try {
      await deleteEquipment(equipmentToDelete.id)
      setEquipment(prev => prev.filter(e => e.id !== equipmentToDelete.id))
      setShowDeleteEquipmentModal(false)
      setEquipmentToDelete(null)
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Failed to delete equipment. Please try again.')
    } finally {
      setDeletingEquipment(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT': return colors.adminSuccess
      case 'GOOD': return colors.adminPrimary
      case 'FAIR': return colors.adminWarning
      case 'POOR': return colors.adminError
      case 'DAMAGED': return '#6B7280'
      default: return colors.textSecondary
    }
  }

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
                    {jobCard.job_card_number} - {jobCard.registration_number}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    {jobCard.make} {jobCard.model} | {jobCard.client_name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(jobCard.payment_status?.toUpperCase())}20`,
                      color: getStatusColor(jobCard.payment_status?.toUpperCase())
                    }}
                  >
                    {jobCard.payment_status}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(jobCard.status?.toUpperCase())}20`,
                      color: getStatusColor(jobCard.status?.toUpperCase())
                    }}
                  >
                    {jobCard.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div style={{ color: colors.textSecondary }}>
                  Mechanic: {jobCard.handled_by_mechanic || 'Not assigned'}
                </div>
                <div style={{ color: colors.textSecondary }}>
                  Phone: {jobCard.client_phone}
                </div>
              </div>
              <div className="flex justify-between items-center text-xs" style={{ color: colors.textTertiary }}>
                <span>Created: {new Date(jobCard.date_created).toLocaleDateString()}</span>
                <span>Est. Cost: KSh {(jobCard.estimated_cost || 0).toLocaleString()}</span>
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
                  Client
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                  Mechanic
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
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.borderLight }}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {jobCard.job_card_number}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {new Date(jobCard.date_created).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {jobCard.registration_number}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {jobCard.make} {jobCard.model}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {jobCard.client_name}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {jobCard.client_phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        {jobCard.handled_by_mechanic || 'Not assigned'}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium w-fit"
                        style={{
                          backgroundColor: `${getStatusColor(jobCard.status?.toUpperCase())}20`,
                          color: getStatusColor(jobCard.status?.toUpperCase())
                        }}
                      >
                        {jobCard.status}
                      </span>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium w-fit"
                        style={{
                          backgroundColor: `${getStatusColor(jobCard.payment_status?.toUpperCase())}20`,
                          color: getStatusColor(jobCard.payment_status?.toUpperCase())
                        }}
                      >
                        {jobCard.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        Est: KSh {(jobCard.estimated_cost || 0).toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        Total: KSh {(jobCard.total_job_value || 0).toLocaleString()}
                      </div>
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
                      <button
                        onClick={() => window.location.href = `/admin/garage-management/job-card/${jobCard.id}/edit`}
                        className="p-1 rounded hover:bg-gray-200 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} style={{ color: colors.adminAccent }} />
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
    <div className="space-y-6">
      {/* Equipment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
          <div className="text-sm" style={{ color: colors.textSecondary }}>Total Equipment</div>
          <div className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>{equipment.length}</div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminSuccess}05` }}>
          <div className="text-sm" style={{ color: colors.textSecondary }}>Available</div>
          <div className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>
            {equipment.filter(e => e.status === 'AVAILABLE').length}
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminWarning}05` }}>
          <div className="text-sm" style={{ color: colors.textSecondary }}>In Maintenance</div>
          <div className="text-2xl font-bold" style={{ color: colors.adminWarning }}>
            {equipment.filter(e => e.status === 'MAINTENANCE').length}
          </div>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminAccent}05` }}>
          <div className="text-sm" style={{ color: colors.textSecondary }}>Total Value</div>
          <div className="text-2xl font-bold" style={{ color: colors.adminAccent }}>
            KSh {equipment.reduce((acc, e) => acc + (e.cost || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <DashboardCard
        title="Garage Equipment"
        subtitle="Manage tools and machinery"
        action={
          <button
            onClick={openAddEquipmentModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Plus size={16} />
            Add Equipment
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(equipment) && equipment.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="p-4 rounded-lg border hover:shadow-md transition-shadow"
              style={{ borderColor: colors.borderLight }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: colors.textPrimary }}>{item.name}</h3>
                  <p className="text-sm line-clamp-2" style={{ color: colors.textSecondary }}>
                    {item.description || 'No description'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(item.status)}20`,
                      color: getStatusColor(item.status)
                    }}
                  >
                    {item.status}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${getConditionColor(item.condition)}20`,
                      color: getConditionColor(item.condition)
                    }}
                  >
                    {item.condition}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {item.serial_number && (
                  <div className="text-xs" style={{ color: colors.textTertiary }}>
                    Serial: {item.serial_number}
                  </div>
                )}
                {item.purchase_date && (
                  <div className="text-xs" style={{ color: colors.textTertiary }}>
                    Purchased: {new Date(item.purchase_date).toLocaleDateString()}
                  </div>
                )}
                <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  Value: KSh {(item.cost || 0).toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: colors.borderLight }}>
                <button
                  onClick={() => openEditEquipmentModal(item)}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} style={{ color: colors.adminPrimary }} />
                </button>
                <button
                  onClick={() => {
                    setEquipmentToDelete(item)
                    setShowDeleteEquipmentModal(true)
                  }}
                  className="p-2 rounded hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash size={16} style={{ color: colors.adminError }} />
                </button>
              </div>
            </motion.div>
          ))}
          {(!Array.isArray(equipment) || equipment.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Wrench className="mx-auto mb-2 opacity-50" size={40} />
              <p>No equipment found. Click "Add Equipment" to get started.</p>
            </div>
          )}
        </div>
      </DashboardCard>

      {/* Equipment Add/Edit Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  {editingEquipment ? 'Update equipment details' : 'Register new equipment'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEquipmentModal(false)
                  resetEquipmentForm()
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} style={{ color: colors.textSecondary }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={equipmentFormData.name}
                  onChange={handleEquipmentFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="e.g. Hydraulic Jack"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={equipmentFormData.description}
                  onChange={handleEquipmentFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="Equipment description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={equipmentFormData.serial_number}
                    onChange={handleEquipmentFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="e.g. SN-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={equipmentFormData.purchase_date}
                    onChange={handleEquipmentFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Cost (KSh)
                </label>
                <input
                  type="number"
                  name="cost"
                  value={equipmentFormData.cost}
                  onChange={handleEquipmentFormChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={equipmentFormData.condition}
                    onChange={handleEquipmentFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={equipmentFormData.status}
                    onChange={handleEquipmentFormChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={equipmentFormData.notes}
                  onChange={handleEquipmentFormChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEquipmentModal(false)
                  resetEquipmentForm()
                }}
                className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEquipment}
                disabled={savingEquipment}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                {savingEquipment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {savingEquipment ? 'Saving...' : (editingEquipment ? 'Update' : 'Create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Equipment Delete Confirmation Modal */}
      {showDeleteEquipmentModal && equipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  Delete Equipment
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  This action cannot be undone
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteEquipmentModal(false)
                  setEquipmentToDelete(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} style={{ color: colors.textSecondary }} />
              </button>
            </div>

            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Are you sure you want to delete <span className="font-semibold">{equipmentToDelete.name}</span>?
              This will permanently remove the equipment record.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteEquipmentModal(false)
                  setEquipmentToDelete(null)
                }}
                className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEquipment}
                disabled={deletingEquipment}
                className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: colors.adminError }}
              >
                {deletingEquipment ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
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
            <div className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>{jobsCompletedThisWeek}</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>Current week performance</div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}05` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.textPrimary }}>Average Completion Time</h3>
            <div className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>{avgCompletionTimeDays} days</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>For completed jobs</div>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}05` }}>
            <h3 className="font-medium mb-2" style={{ color: colors.textPrimary }}>Urgent Jobs</h3>
            <div className="text-2xl font-bold" style={{ color: colors.adminAccent }}>{urgentJobsCount}</div>
            <div className="text-sm" style={{ color: colors.textSecondary }}>Requiring immediate attention</div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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