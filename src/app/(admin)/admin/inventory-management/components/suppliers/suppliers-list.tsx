'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import DashboardCard from '@/components/shared/dashboard-card'
import {
  fetchInventorySuppliers,
  fetchSupplierStats,
  deleteInventorySupplier,
} from '@/lib/api'
import {
  InventorySupplier,
  SupplierStats,
} from '@/types/inventory-api'

interface SuppliersListProps {
  onAdd: () => void
  onEdit: (supplier: InventorySupplier) => void
  onView: (supplier: InventorySupplier) => void
  refreshTrigger: number
}

export default function SuppliersList({ onAdd, onEdit, onView, refreshTrigger }: SuppliersListProps) {
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [stats, setStats] = useState<SupplierStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(6) // 6 per page for grid layout
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadSuppliersData()
  }, [refreshTrigger, currentPage])

  const loadSuppliersData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [suppliersResponse, statsResponse] = await Promise.all([
        fetchInventorySuppliers(currentPage, pageSize),
        fetchSupplierStats(),
      ])

      setSuppliers(suppliersResponse.results || [])
      setStats(statsResponse)

      if (suppliersResponse.count) {
        setTotalCount(suppliersResponse.count)
        setTotalPages(Math.ceil(suppliersResponse.count / pageSize))
      }
    } catch (err) {
      console.error('Error loading suppliers data:', err)
      setError('Failed to load suppliers data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete supplier "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(id)
      await deleteInventorySupplier(id)
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id))
    } catch (err) {
      console.error('Error deleting supplier:', err)
      alert('Failed to delete supplier. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const getSupplierRating = (supplier: InventorySupplier) => {
    // Calculate rating based on supplier performance metrics
    if (supplier.total_orders === 0) return 0

    const onTimeDeliveryRate = supplier.on_time_deliveries / supplier.total_orders
    const qualityRate = 1 - (supplier.quality_issues / supplier.total_orders)

    return Math.round((onTimeDeliveryRate * 0.6 + qualityRate * 0.4) * 5)
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>
          ({rating}/5)
        </span>
      </div>
    )
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus

    return matchesSearch && matchesStatus
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
          onClick={loadSuppliersData}
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
            title="Total Suppliers"
            subtitle="Active suppliers"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>
                  {stats.total_suppliers?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Registered suppliers
                </p>
              </div>
              <Building size={32} style={{ color: colors.adminPrimary }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Active Suppliers"
            subtitle="Currently active"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>
                  {stats.active_suppliers?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Status: Active
                </p>
              </div>
              <TrendingUp size={32} style={{ color: colors.adminSuccess }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Total Parts Supplied"
            subtitle="Across all suppliers"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.adminWarning }}>
                  {stats.total_parts?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Parts catalog
                </p>
              </div>
              <Package size={32} style={{ color: colors.adminWarning }} />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent Activity"
            subtitle="This month"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                  {stats.recent_orders?.toLocaleString() || 0}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  New orders
                </p>
              </div>
              <Calendar size={32} style={{ color: colors.supervisorPrimary }} />
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Main Content */}
      <DashboardCard
        title="Suppliers Management"
        subtitle="Manage your parts suppliers and vendor relationships"
      >
        <div className="space-y-6">
          {/* Header with Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or contact person..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: colors.borderLight }}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>

              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                <Plus size={16} />
                Add Supplier
              </button>
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {suppliers.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Building size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    No Suppliers Found
                  </h3>
                  <p style={{ color: colors.textSecondary }}>
                    {searchTerm || filterStatus !== 'all'
                      ? 'No suppliers match your current filters'
                      : 'Start by adding your first supplier'
                    }
                  </p>
                </div>
              ) : (
                suppliers.map((supplier) => {
                  const rating = getSupplierRating(supplier)
                  const isDeleting = deletingId === supplier.id

                  return (
                    <motion.div
                      key={supplier.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold mb-1 cursor-pointer hover:underline"
                            style={{ color: colors.textPrimary }}
                            onClick={() => onView(supplier)}
                          >
                            {supplier.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supplier.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                supplier.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {supplier.status}
                          </span>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => onEdit(supplier)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit size={16} style={{ color: colors.textSecondary }} />
                          </button>
                          <button
                            onClick={() => handleDelete(supplier.id, supplier.name)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete Supplier"
                          >
                            <Trash2 size={16} className={isDeleting ? 'animate-spin text-red-500' : 'text-red-500'} />
                          </button>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2 mb-4">
                        {supplier.contact_person && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              {supplier.contact_person}
                            </span>
                          </div>
                        )}

                        {supplier.contact_email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} style={{ color: colors.textSecondary }} />
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              {supplier.contact_email}
                            </span>
                          </div>
                        )}

                        {supplier.contact_phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} style={{ color: colors.textSecondary }} />
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              {supplier.contact_phone}
                            </span>
                          </div>
                        )}

                        {supplier.address && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} style={{ color: colors.textSecondary }} />
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              {supplier.address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Performance Metrics */}
                      <div className="border-t pt-4" style={{ borderColor: colors.borderLight }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            Performance Rating
                          </span>
                          {renderStarRating(rating)}
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: colors.adminPrimary }}>
                              {supplier.total_orders || 0}
                            </p>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>
                              Orders
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: colors.adminSuccess }}>
                              {supplier.parts_supplied || 0}
                            </p>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>
                              Parts
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: colors.adminWarning }}>
                              {supplier.on_time_deliveries && supplier.total_orders
                                ? Math.round((supplier.on_time_deliveries / supplier.total_orders) * 100)
                                : 0}%
                            </p>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>
                              On Time
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} suppliers
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    style={{ color: colors.textPrimary }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    style={{ color: colors.textPrimary }}
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                            }`}
                          style={currentPage !== pageNum ? { color: colors.textPrimary } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    style={{ color: colors.textPrimary }}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    style={{ color: colors.textPrimary }}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}