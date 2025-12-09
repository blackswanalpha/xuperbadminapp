'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Plus, Edit, Eye, MoreHorizontal } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventoryItems,
  fetchVehicleDetailedInfo,
} from '@/lib/api'
import {
  InventoryItem,
  VehicleDetailedInfo,
  ApiResponse,
  InventoryFilters,
} from '@/types/inventory-api'

// Import sub-components (to be created)
import VehicleDetailsModal from './vehicle-details-modal'
import VehicleHistoryModal from './vehicle-history-modal'
import EditInventoryModal from './edit-inventory-modal'

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [searchTerm, conditionFilter])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: InventoryFilters = {
        ...(searchTerm && { search: searchTerm }),
        ...(conditionFilter && { condition: conditionFilter }),
        ordering: '-vehicle__year',
      }

      const response: ApiResponse<InventoryItem> = await fetchInventoryItems(filters)
      setVehicles(response.results)
    } catch (err) {
      console.error('Error loading vehicles:', err)
      setError('Failed to load vehicle inventory')
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (vehicleId: number) => {
    setSelectedVehicle(vehicleId)
    setShowDetailsModal(true)
  }

  const handleViewHistory = (vehicleId: number) => {
    setSelectedVehicle(vehicleId)
    setShowHistoryModal(true)
  }

  const handleEditInventory = (vehicleId: number) => {
    setSelectedVehicle(vehicleId)
    setShowEditModal(true)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return colors.adminSuccess
      case 'GOOD':
        return colors.adminPrimary
      case 'FAIR':
        return colors.adminWarning
      case 'POOR':
        return colors.adminError
      default:
        return colors.textSecondary
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return colors.adminSuccess
      case 'hired':
        return colors.adminPrimary
      case 'maintenance':
        return colors.adminWarning
      default:
        return colors.textSecondary
    }
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'N/A'
    return `KSh ${parseFloat(amount).toLocaleString()}`
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
            Vehicle Inventory
          </h2>
          <p style={{ color: colors.textSecondary }}>
            Manage vehicle inventory items and track vehicle status
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/vehicle-management'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <DashboardCard
        title="Filters"
        subtitle="Filter and search vehicle inventory"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: colors.textTertiary }}
            />
            <input
              type="text"
              placeholder="Search by make, model, registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: colors.borderLight }}
            />
          </div>
          
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
            style={{ borderColor: colors.borderLight }}
          >
            <option value="">All Conditions</option>
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('')
              setConditionFilter('')
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.borderLight }}
          >
            Clear
          </button>
        </div>
      </DashboardCard>

      {/* Vehicle Inventory Table */}
      <DashboardCard
        title="Vehicle Inventory"
        subtitle={`${vehicles.length} vehicles in inventory`}
      >
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadVehicles}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: colors.textSecondary }}>
              No vehicles found matching your criteria
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                  <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                    Vehicle
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                    Registration
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                    Condition
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                    Current Value
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
                {vehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.vehicle}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="border-b hover:bg-gray-50 transition-colors"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h4>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>
                          {vehicle.category}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                      {vehicle.registration_number}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getConditionColor(vehicle.condition)}20`,
                          color: getConditionColor(vehicle.condition),
                        }}
                      >
                        {vehicle.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                      {vehicle.location}
                    </td>
                    <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                      {formatCurrency(vehicle.current_value)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: vehicle.available 
                            ? `${colors.adminSuccess}20` 
                            : vehicle.rented 
                              ? `${colors.adminPrimary}20`
                              : `${colors.adminWarning}20`,
                          color: vehicle.available 
                            ? colors.adminSuccess 
                            : vehicle.rented 
                              ? colors.adminPrimary
                              : colors.adminWarning,
                        }}
                      >
                        {vehicle.available ? 'Available' : vehicle.rented ? 'Hired' : 'Maintenance'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(vehicle.vehicle)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} style={{ color: colors.textSecondary }} />
                        </button>
                        <button
                          onClick={() => handleViewHistory(vehicle.vehicle)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="View History"
                        >
                          <MoreHorizontal size={16} style={{ color: colors.textSecondary }} />
                        </button>
                        <button
                          onClick={() => handleEditInventory(vehicle.vehicle)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit Inventory"
                        >
                          <Edit size={16} style={{ color: colors.textSecondary }} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      {/* Modals */}
      {showDetailsModal && selectedVehicle && (
        <VehicleDetailsModal
          vehicleId={selectedVehicle}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showHistoryModal && selectedVehicle && (
        <VehicleHistoryModal
          vehicleId={selectedVehicle}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showEditModal && selectedVehicle && (
        <EditInventoryModal
          vehicleId={selectedVehicle}
          onClose={() => setShowEditModal(false)}
          onUpdate={loadVehicles}
        />
      )}
    </div>
  )
}