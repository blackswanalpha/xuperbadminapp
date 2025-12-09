'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, DollarSign, User, FileText } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchVehicleDetailedInfo,
} from '@/lib/api'
import {
  VehicleDetailedInfo,
} from '@/types/inventory-api'

interface VehicleHistoryModalProps {
  vehicleId: number
  onClose: () => void
}

export default function VehicleHistoryModal({ vehicleId, onClose }: VehicleHistoryModalProps) {
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailedInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVehicleHistory()
  }, [vehicleId])

  const loadVehicleHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const details = await fetchVehicleDetailedInfo(vehicleId)
      setVehicleDetails(details)
    } catch (err) {
      console.error('Error loading vehicle history:', err)
      setError('Failed to load vehicle history')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              Vehicle History
            </h2>
            {vehicleDetails && (
              <p style={{ color: colors.textSecondary }}>
                {vehicleDetails.vehicle_info.registration_number} - Complete rental and maintenance history
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadVehicleHistory}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contract History */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <FileText size={20} />
                  Contract History
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Contract #
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Driver
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Period
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleDetails?.contracts_history.map((contract) => (
                        <tr key={contract.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: colors.borderLight }}>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                            #{contract.id}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {contract.client_name}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {contract.driver_name}
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                          </td>
                          <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                            {formatCurrency(contract.total_amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: contract.status === 'COMPLETED' 
                                  ? `${colors.adminSuccess}20` 
                                  : contract.status === 'ACTIVE'
                                    ? `${colors.adminPrimary}20`
                                    : `${colors.adminWarning}20`,
                                color: contract.status === 'COMPLETED' 
                                  ? colors.adminSuccess 
                                  : contract.status === 'ACTIVE'
                                    ? colors.adminPrimary
                                    : colors.adminWarning,
                              }}
                            >
                              {contract.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance History */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Clock size={20} />
                  Maintenance History
                </h3>
                <div className="space-y-3">
                  {vehicleDetails?.maintenance_records.map((record) => (
                    <div key={record.id} className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                            {record.service_type}
                          </h4>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {record.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                              <Clock size={14} />
                              {formatDate(record.date)}
                            </span>
                            <span className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                              <DollarSign size={14} />
                              {formatCurrency(record.cost)}
                            </span>
                          </div>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: record.status === 'COMPLETED' 
                              ? `${colors.adminSuccess}20` 
                              : `${colors.adminWarning}20`,
                            color: record.status === 'COMPLETED' 
                              ? colors.adminSuccess 
                              : colors.adminWarning,
                          }}
                        >
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location History */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <User size={20} />
                  Location History
                </h3>
                <div className="space-y-3">
                  {vehicleDetails?.location_history.map((location, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${location.is_current ? 'border-green-300 bg-green-50' : ''}`}
                      style={{ borderColor: location.is_current ? colors.adminSuccess : colors.borderLight }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                            {location.location}
                          </h4>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            Since {formatDate(location.date)} • Duration: {location.duration}
                          </p>
                        </div>
                        {location.is_current && (
                          <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ 
                            backgroundColor: `${colors.adminSuccess}20`,
                            color: colors.adminSuccess 
                          }}>
                            Current Location
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}