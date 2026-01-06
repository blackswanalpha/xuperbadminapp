'use client'

import { useState, useEffect } from 'react'
import { fetchVehicles, Vehicle, deleteVehicle, fetchVehicleStatistics, fetchSuppliers, Supplier } from '@/lib/api'

import { motion } from 'framer-motion'
import { Car, Wrench, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [supplierFilter, setSupplierFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [vehiclesResponse, statsData, suppliersData] = await Promise.all([
          fetchVehicles(currentPage, pageSize),
          fetchVehicleStatistics().catch(() => null), // Statistics might not be available
          fetchSuppliers()
        ])
        setVehicles(vehiclesResponse.vehicles)
        setSuppliers(suppliersData)
        setFilteredVehicles(vehiclesResponse.vehicles)
        setTotalPages(vehiclesResponse.totalPages)
        setTotalCount(vehiclesResponse.totalCount)
        setStatistics(statsData)
      } catch (err) {
        setError('Failed to load vehicles')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentPage])

  // Filter and search effect
  useEffect(() => {
    if (!Array.isArray(vehicles)) return

    let filtered = [...vehicles]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.color && vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    // Apply supplier filter
    if (supplierFilter !== 'ALL') {
      filtered = filtered.filter(vehicle => {
        const supplierId = typeof vehicle.supplier === 'string' ? vehicle.supplier : vehicle.supplier?.id
        const supplierName = suppliers.find(s => s.id === supplierId)?.name || 'Unknown'
        return supplierName === supplierFilter
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Vehicle]
      let bValue = b[sortBy as keyof Vehicle]

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if ((aValue ?? 0) < (bValue ?? 0)) return sortOrder === 'asc' ? -1 : 1
      if ((aValue ?? 0) > (bValue ?? 0)) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredVehicles(filtered)
  }, [vehicles, suppliers, searchTerm, statusFilter, supplierFilter, sortBy, sortOrder])

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return

    try {
      await deleteVehicle(selectedVehicle.id)
      const updatedVehicles = vehicles.filter(v => v.id !== selectedVehicle.id)
      setVehicles(updatedVehicles)
      setFilteredVehicles(filteredVehicles.filter(v => v.id !== selectedVehicle.id))
      setDeleteModalOpen(false)
      setSelectedVehicle(null)
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Failed to delete vehicle. Please try again.')
    }
  }

  const stats = [
    {
      title: 'Total Vehicles',
      value: statistics?.total?.toString() || (Array.isArray(vehicles) ? vehicles.length.toString() : '0'),
      icon: Car,
      trend: { value: '+2', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Available',
      value: statistics?.available?.toString() || (Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'AVAILABLE').length.toString() : '0'),
      icon: Car,
      trend: { value: '+3', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Hired',
      value: statistics?.hired?.toString() || (Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'HIRED').length.toString() : '0'),
      icon: Car,
      trend: { value: `${statistics?.hired || 0}/${statistics?.total || vehicles.length}`, isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'In Garage',
      value: statistics?.in_garage?.toString() || (Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'IN_GARAGE').length.toString() : '0'),
      icon: Wrench,
      trend: { value: '-1', isPositive: true },
      color: colors.adminWarning,
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
            Fleet Management
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Manage vehicles, track expenses, and monitor maintenance
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/fleet-management/create'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={20} />
          Add Vehicle
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

      {/* Vehicles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <DashboardCard
          title="Vehicle Fleet"
          subtitle="All registered vehicles"
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
                  placeholder="Search vehicles..."
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
                <option value="AVAILABLE">Available</option>
                <option value="HIRED">Hired</option>
                <option value="IN_GARAGE">In Garage</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>

              {/* Supplier Filter */}
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                style={{ borderColor: colors.borderLight }}
              >
                <option value="ALL">All Suppliers</option>
                {Array.from(new Set(vehicles.map(v => {
                  const supplierId = typeof v.supplier === 'string' ? v.supplier : v.supplier?.id
                  return suppliers.find(s => s.id === supplierId)?.name
                }).filter(Boolean))).map(supplierName => (
                  <option key={supplierName} value={supplierName}>{supplierName}</option>
                ))}
              </select>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                  style={{ borderColor: colors.borderLight }}
                >
                  <option value="created_at">Date Added</option>
                  <option value="make">Make</option>
                  <option value="model">Model</option>
                  <option value="year">Year</option>
                  <option value="registration_number">Registration</option>
                  <option value="status">Status</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                  style={{ borderColor: colors.borderLight }}
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== 'ALL' || supplierFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                    setSupplierFilter('ALL')
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
              <div className="p-8 text-center text-gray-500">Loading vehicles...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Vehicle ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Make & Model
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Registration Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Supplier Name
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
                  {Array.isArray(filteredVehicles) && filteredVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        #{vehicle.id}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {vehicle.make} {vehicle.model}
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                        {vehicle.registration_number}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {(() => {
                          const supplierId = typeof vehicle.supplier === 'string' ? vehicle.supplier : vehicle.supplier?.id
                          const supplier = suppliers.find(s => s.id === supplierId)
                          return supplier ? supplier.name : 'Unknown'
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              vehicle.status === 'AVAILABLE'
                                ? `${colors.adminSuccess}20`
                                : vehicle.status === 'ON_TRIP'
                                  ? `${colors.adminPrimary}20`
                                  : `${colors.adminWarning}20`,
                            color:
                              vehicle.status === 'AVAILABLE'
                                ? colors.adminSuccess
                                : vehicle.status === 'ON_TRIP'
                                  ? colors.adminPrimary
                                  : colors.adminWarning,
                          }}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.location.href = `/admin/fleet-management/${vehicle.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} style={{ color: colors.adminPrimary }} />
                          </button>
                          <button
                            onClick={() => window.location.href = `/admin/fleet-management/${vehicle.id}/edit`}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Edit Vehicle"
                          >
                            <Edit size={16} style={{ color: colors.adminAccent }} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setDeleteModalOpen(true)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Delete Vehicle"
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
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} vehicles
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Confirm Delete
            </h3>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Are you sure you want to delete vehicle "{selectedVehicle.make} {selectedVehicle.model}"
              (Registration: {selectedVehicle.registration_number})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false)
                  setSelectedVehicle(null)
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ color: colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
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

