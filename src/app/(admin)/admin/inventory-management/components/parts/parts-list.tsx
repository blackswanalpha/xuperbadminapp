'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import {
  fetchParts,
  fetchPartCategories,
  fetchInventorySuppliers,
  deletePart,
} from '@/lib/api'
import {
  Part,
  PartCategory,
  InventorySupplier,
  ApiResponse,
  PartsFilters,
} from '@/types/inventory-api'

interface PartsListProps {
  onEdit: (part: Part) => void
  onAdd: () => void
  onStockAdjustment: (part: Part) => void
  refreshTrigger: number
}

export default function PartsList({ onEdit, onAdd, onStockAdjustment, refreshTrigger }: PartsListProps) {
  const [parts, setParts] = useState<Part[]>([])
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [refreshTrigger, currentPage])

  useEffect(() => {
    setCurrentPage(1)
    filterParts()
  }, [searchTerm, categoryFilter, supplierFilter, unitFilter, showLowStockOnly])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [partsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        fetchParts({ ordering: '-created_at' }, currentPage, pageSize),
        fetchPartCategories(),
        fetchInventorySuppliers(),
      ])

      setParts(partsResponse.results)
      setCategories(categoriesResponse.results)
      setSuppliers(suppliersResponse.results)

      if (partsResponse.count) {
        setTotalCount(partsResponse.count)
        setTotalPages(Math.ceil(partsResponse.count / pageSize))
      }
    } catch (err) {
      console.error('Error loading parts data:', err)
      setError('Failed to load parts data')
      setParts([])
      setCategories([])
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const filterParts = async () => {
    if (!searchTerm && !categoryFilter && !supplierFilter && !unitFilter && !showLowStockOnly) {
      return loadData()
    }

    try {
      setLoading(true)
      const filters: PartsFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: parseInt(categoryFilter) }),
        ...(supplierFilter && { supplier: parseInt(supplierFilter) }),
        ...(unitFilter && { unit: unitFilter }),
        ordering: '-created_at',
      }

      const response = await fetchParts(filters, currentPage, pageSize)
      let filteredParts = response.results

      if (showLowStockOnly) {
        filteredParts = filteredParts.filter(part => part.is_low_stock)
      }

      setParts(filteredParts)
      if (response.count) {
        setTotalCount(response.count)
        setTotalPages(Math.ceil(response.count / pageSize))
      }
    } catch (err) {
      console.error('Error filtering parts:', err)
      setError('Failed to filter parts')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePart = async (part: Part) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${part.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await deletePart(part.id)
      await loadData()
    } catch (err) {
      console.error('Error deleting part:', err)
      alert('Failed to delete part. It may be in use.')
    }
  }

  const formatCurrency = (amount: string) => {
    return `KSh ${parseFloat(amount).toLocaleString()}`
  }

  const getStockStatus = (part: Part) => {
    if (part.current_stock === 0) {
      return { text: 'Out of Stock', color: colors.adminError }
    }
    if (part.is_low_stock) {
      return { text: 'Low Stock', color: colors.adminWarning }
    }
    return { text: 'In Stock', color: colors.adminSuccess }
  }

  const calculateStockDays = (part: Part) => {
    // Estimate days of stock remaining based on average usage
    // This is a simple calculation - in reality you'd use historical usage data
    const avgDailyUsage = 0.5 // Placeholder - would come from usage analytics
    return Math.floor(part.current_stock / avgDailyUsage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
            Parts Inventory
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Manage parts inventory, stock levels, and pricing
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={20} />
          Add Part
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Total Parts" subtitle={parts.length.toString()}>
          <div className="flex items-center gap-2">
            <Package size={24} style={{ color: colors.adminPrimary }} />
            <span className="text-lg font-semibold">{parts.length}</span>
          </div>
        </DashboardCard>

        <DashboardCard title="Low Stock Alerts" subtitle={parts.filter(p => p.is_low_stock).length.toString()}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={24} style={{ color: colors.adminWarning }} />
            <span className="text-lg font-semibold">{parts.filter(p => p.is_low_stock).length}</span>
          </div>
        </DashboardCard>

        <DashboardCard title="Out of Stock" subtitle={parts.filter(p => p.current_stock === 0).length.toString()}>
          <div className="flex items-center gap-2">
            <TrendingDown size={24} style={{ color: colors.adminError }} />
            <span className="text-lg font-semibold">{parts.filter(p => p.current_stock === 0).length}</span>
          </div>
        </DashboardCard>

        <DashboardCard title="Total Stock Value" subtitle={`KSh ${parts.reduce((sum, part) => sum + parseFloat(part.stock_value), 0).toLocaleString()}`}>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} style={{ color: colors.adminSuccess }} />
            <span className="text-lg font-semibold">
              {formatCurrency(parts.reduce((sum, part) => sum + parseFloat(part.stock_value), 0).toString())}
            </span>
          </div>
        </DashboardCard>
      </div>

      {/* Filters */}
      <DashboardCard title="Filters" subtitle="Filter and search parts inventory">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative lg:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colors.textTertiary }}
            />
            <input
              type="text"
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: colors.borderLight }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: colors.borderLight }}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: colors.borderLight }}
          >
            <option value="">All Units</option>
            <option value="PIECE">Piece</option>
            <option value="SET">Set</option>
            <option value="LITER">Liter</option>
            <option value="KILOGRAM">Kilogram</option>
            <option value="METER">Meter</option>
            <option value="PAIR">Pair</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              Low stock only
            </span>
          </label>
        </div>
      </DashboardCard>

      {/* Parts Table */}
      <DashboardCard
        title="Parts List"
        subtitle={`${parts.length} parts found`}
      >
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p style={{ color: colors.textSecondary }}>
              No parts found matching your criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Part Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Stock Level
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Unit Cost
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Stock Value
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
                  {parts.map((part, index) => {
                    const status = getStockStatus(part)
                    return (
                      <motion.tr
                        key={part.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.borderLight }}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                              {part.name}
                            </h4>
                            <p className="text-sm" style={{ color: colors.textSecondary }}>
                              {part.description}
                            </p>
                            {part.location && (
                              <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                                📍 {part.location}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm" style={{ color: colors.textPrimary }}>
                          {part.sku}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          {part.category_name || 'Uncategorized'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold" style={{ color: colors.textPrimary }}>
                              {part.current_stock} {part.unit}
                            </span>
                            <span className="text-xs" style={{ color: colors.textSecondary }}>
                              Min: {part.min_stock_level} | Max: {part.max_stock_level}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                          {formatCurrency(part.unit_cost)}
                        </td>
                        <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                          {formatCurrency(part.stock_value)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${status.color}20`,
                              color: status.color,
                            }}
                          >
                            {status.text}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEdit(part)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Edit Part"
                            >
                              <Edit size={16} style={{ color: colors.textSecondary }} />
                            </button>
                            <button
                              onClick={() => onStockAdjustment(part)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Adjust Stock"
                            >
                              <MoreHorizontal size={16} style={{ color: colors.textSecondary }} />
                            </button>
                            <button
                              onClick={() => handleDeletePart(part)}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-red-500"
                              title="Delete Part"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} parts
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
        )}
      </DashboardCard>
    </div>
  )
}