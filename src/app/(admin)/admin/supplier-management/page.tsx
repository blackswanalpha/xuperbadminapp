'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSuppliers, createSupplier, deleteSupplier, fetchGeneralSupplierStats, Supplier, GeneralSupplierStats } from '@/lib/api'
import { motion } from 'framer-motion'
import { Package, Plus, Search, Eye, Edit, Trash2, Phone, Mail, MapPin, User } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function SupplierManagementPage() {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierStats, setSupplierStats] = useState<GeneralSupplierStats | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    loadSuppliers()
  }, [])

  // Filter and search effect
  useEffect(() => {
    if (!Array.isArray(suppliers)) return

    let filtered = [...suppliers]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplier_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(supplier =>
        statusFilter === 'ACTIVE' ? supplier.is_active : !supplier.is_active
      )
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedResults = filtered.slice(startIndex, endIndex)

    setFilteredSuppliers(paginatedResults)
    setTotalPages(Math.ceil(filtered.length / pageSize))
  }, [suppliers, searchTerm, statusFilter, currentPage])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await fetchSuppliers()
      setSuppliers(data)
      setFilteredSuppliers(data)

      const stats = await fetchGeneralSupplierStats()
      setSupplierStats(stats)
    } catch (err) {
      setError('Failed to load suppliers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      title: 'Total Suppliers',
      value: supplierStats?.total_suppliers?.toString() || suppliers.length.toString(),
      icon: Package,
      trend: { value: '+2', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active Suppliers',
      value: suppliers.filter(s => s.is_active).length.toString(),
      icon: Package,
      trend: { value: '+1', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Inactive Suppliers',
      value: suppliers.filter(s => !s.is_active).length.toString(),
      icon: Package,
      trend: { value: '0', isPositive: true },
      color: colors.adminWarning,
    },
    {
      title: 'Total Vehicles Supplied',
      value: supplierStats?.total_vehicles_supplied?.toString() || '0',
      icon: Package,
      trend: { value: '+5', isPositive: true },
      color: colors.adminAccent,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Supplier Management
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Manage vehicle suppliers, track purchases, and monitor supplier performance
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={20} />
          Add Supplier
        </button>
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

      {/* Suppliers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <DashboardCard
          title="Suppliers"
          subtitle="All registered suppliers"
          action={
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Input */}
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
                  placeholder="Search suppliers..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm w-64"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                style={{ borderColor: colors.borderLight }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                  }}
                  className="px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  style={{ color: colors.textSecondary }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          }
        >
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading suppliers...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Supplier Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Contact Info
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredSuppliers) && filteredSuppliers.map((supplier, index) => (
                    <motion.tr
                      key={supplier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        {supplier.supplier_code}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium" style={{ color: colors.textPrimary }}>
                            {supplier.name}
                          </div>
                          {supplier.contact_person && (
                            <div className="text-sm" style={{ color: colors.textSecondary }}>
                              Contact: {supplier.contact_person}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                              <Mail size={12} />
                              {supplier.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                            <Phone size={12} />
                            {supplier.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: supplier.is_active ? `${colors.adminSuccess}20` : `${colors.adminError}20`,
                            color: supplier.is_active ? colors.adminSuccess : colors.adminError,
                          }}
                        >
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              // Navigate to supplier details
                              router.push(`/admin/supplier-management/${supplier.id}`)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: colors.adminPrimary }} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              // Open edit modal
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Supplier"
                          >
                            <Edit size={16} style={{ color: colors.adminAccent }} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setDeleteModalOpen(true)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Delete Supplier"
                          >
                            <Trash2 size={16} style={{ color: colors.adminError }} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: colors.borderLight }}>
              <div className="text-sm" style={{ color: colors.textSecondary }}>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredSuppliers.length)} of {suppliers.length} suppliers
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  style={{ color: colors.textPrimary }}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const pageNum = startPage + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                        ? 'text-white'
                        : 'hover:bg-gray-100'
                        }`}
                      style={{
                        backgroundColor: currentPage === pageNum ? colors.adminPrimary : 'transparent',
                        color: currentPage === pageNum ? 'white' : colors.textPrimary,
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
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
        </DashboardCard>
      </motion.div>

      {/* Add Supplier Modal */}
      {addModalOpen && (
        <AddSupplierModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={loadSuppliers}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Confirm Delete
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Are you sure you want to delete supplier "{selectedSupplier.name}"
              ({selectedSupplier.supplier_code})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setSelectedSupplier(null)
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedSupplier) {
                    try {
                      await deleteSupplier(selectedSupplier.id)
                      // Remove from local state to avoid full reload flicker
                      setSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id))
                      setFilteredSuppliers(prev => prev.filter(s => s.id !== selectedSupplier.id))

                      setDeleteModalOpen(false)
                      setSelectedSupplier(null)
                    } catch (err) {
                      console.error('Failed to delete supplier', err)
                      alert('Failed to delete supplier. Please try again.')
                    }
                  }
                }}
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.adminError }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Add Supplier Modal Component
function AddSupplierModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    tax_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSupplier(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Add New Supplier
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Supplier Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
              Tax ID (KRA PIN)
            </label>
            <input
              type="text"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              {loading ? 'Creating...' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}