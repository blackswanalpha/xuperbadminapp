'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Car, DollarSign, MapPin, Calendar, Wrench, TrendingUp, FileText } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchVehicleDetailedInfo,
} from '@/lib/api'
import {
  VehicleDetailedInfo,
} from '@/types/inventory-api'

interface VehicleDetailsModalProps {
  vehicleId: number
  onClose: () => void
}

export default function VehicleDetailsModal({ vehicleId, onClose }: VehicleDetailsModalProps) {
  const [vehicleDetails, setVehicleDetails] = useState<VehicleDetailedInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'maintenance' | 'documents'>('overview')

  useEffect(() => {
    loadVehicleDetails()
  }, [vehicleId])

  const loadVehicleDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const details = await fetchVehicleDetailedInfo(vehicleId)
      setVehicleDetails(details)
    } catch (err) {
      console.error('Error loading vehicle details:', err)
      setError('Failed to load vehicle details')
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

  const sections = [
    { id: 'overview', label: 'Overview', icon: Car },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText },
  ]

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Vehicle Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Registration Number
            </label>
            <p className="text-base" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.registration_number}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Make & Model
            </label>
            <p className="text-base" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.year} {vehicleDetails?.vehicle_info.make} {vehicleDetails?.vehicle_info.model}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Category
            </label>
            <p className="text-base" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.category}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Condition
            </label>
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${colors.adminSuccess}20`,
                color: colors.adminSuccess,
              }}
            >
              {vehicleDetails?.vehicle_info.condition}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Features
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {vehicleDetails?.vehicle_info.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    backgroundColor: `${colors.adminPrimary}10`,
                    color: colors.adminPrimary,
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Financial Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Purchase Price
            </label>
            <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.purchase_price 
                ? formatCurrency(parseFloat(vehicleDetails.vehicle_info.purchase_price))
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Current Value
            </label>
            <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.current_value 
                ? formatCurrency(parseFloat(vehicleDetails.vehicle_info.current_value))
                : 'N/A'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Maintenance Cost
            </label>
            <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.maintenance_cost 
                ? formatCurrency(parseFloat(vehicleDetails.vehicle_info.maintenance_cost))
                : 'KSh 0'
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Daily Rate
            </label>
            <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.vehicle_info.daily_rate 
                ? formatCurrency(parseFloat(vehicleDetails.vehicle_info.daily_rate))
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
          <h4 className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Total Revenue
          </h4>
          <p className="text-xl font-bold" style={{ color: colors.adminSuccess }}>
            {formatCurrency(vehicleDetails?.analytics.total_revenue || 0)}
          </p>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
          <h4 className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Utilization Rate
          </h4>
          <p className="text-xl font-bold" style={{ color: colors.adminPrimary }}>
            {vehicleDetails?.analytics.utilization_rate || 0}%
          </p>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
          <h4 className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Total Contracts
          </h4>
          <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            {vehicleDetails?.analytics.total_contracts || 0}
          </p>
        </div>
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
          <h4 className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Avg Duration
          </h4>
          <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            {vehicleDetails?.analytics.avg_rental_duration || 0} days
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Recent Contracts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Client
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Period
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Amount
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicleDetails?.contracts_history.slice(0, 5).map((contract) => (
                <tr key={contract.id} className="border-b" style={{ borderColor: colors.borderLight }}>
                  <td className="py-2 px-3 text-sm" style={{ color: colors.textPrimary }}>
                    {contract.client_name}
                  </td>
                  <td className="py-2 px-3 text-sm" style={{ color: colors.textSecondary }}>
                    {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                  </td>
                  <td className="py-2 px-3 text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {formatCurrency(contract.total_amount)}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: contract.status === 'COMPLETED' 
                          ? `${colors.adminSuccess}20` 
                          : `${colors.adminPrimary}20`,
                        color: contract.status === 'COMPLETED' 
                          ? colors.adminSuccess 
                          : colors.adminPrimary,
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
    </div>
  )

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Inspection Schedule
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
              <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Last Inspection
              </label>
              <p style={{ color: colors.textPrimary }}>
                {vehicleDetails?.vehicle_info.last_inspection 
                  ? formatDate(vehicleDetails.vehicle_info.last_inspection)
                  : 'N/A'
                }
              </p>
            </div>
            <div className="p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
              <label className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Next Inspection
              </label>
              <p style={{ color: colors.textPrimary }}>
                {vehicleDetails?.vehicle_info.next_inspection 
                  ? formatDate(vehicleDetails.vehicle_info.next_inspection)
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
            Location History
          </h3>
          <div className="space-y-2">
            {vehicleDetails?.location_history.map((location, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${location.is_current ? 'border-green-300 bg-green-50' : ''}`}
                style={{ borderColor: location.is_current ? colors.adminSuccess : colors.borderLight }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {location.location}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {formatDate(location.date)} • {location.duration}
                    </p>
                  </div>
                  {location.is_current && (
                    <span className="text-xs px-2 py-1 rounded" style={{ 
                      backgroundColor: `${colors.adminSuccess}20`,
                      color: colors.adminSuccess 
                    }}>
                      Current
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Maintenance Records
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
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {formatDate(record.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {formatCurrency(record.cost)}
                  </p>
                  <span
                    className="text-xs px-2 py-1 rounded"
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
        Vehicle Documents & Compliance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicleDetails?.documents.map((doc, index) => (
          <div key={index} className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium" style={{ color: colors.textPrimary }}>
                  {doc.type}
                </h4>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Expires: {formatDate(doc.expires_at)}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: doc.status_color === 'success' 
                    ? `${colors.adminSuccess}20` 
                    : doc.status_color === 'warning'
                      ? `${colors.adminWarning}20`
                      : `${colors.adminError}20`,
                  color: doc.status_color === 'success' 
                    ? colors.adminSuccess 
                    : doc.status_color === 'warning'
                      ? colors.adminWarning
                      : colors.adminError,
                }}
              >
                {doc.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 rounded-lg border text-center" style={{ borderColor: colors.borderLight }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Average Rating</p>
            <p className="text-lg font-bold" style={{ color: colors.adminPrimary }}>
              {vehicleDetails?.performance_metrics.average_rating}/5
            </p>
          </div>
          <div className="p-3 rounded-lg border text-center" style={{ borderColor: colors.borderLight }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Total KM</p>
            <p className="text-lg font-bold" style={{ color: colors.textPrimary }}>
              {vehicleDetails?.performance_metrics.total_kilometers.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg border text-center" style={{ borderColor: colors.borderLight }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Fuel Efficiency</p>
            <p className="text-lg font-bold" style={{ color: colors.adminSuccess }}>
              {vehicleDetails?.performance_metrics.fuel_efficiency} km/l
            </p>
          </div>
          <div className="p-3 rounded-lg border text-center" style={{ borderColor: colors.borderLight }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Cost per KM</p>
            <p className="text-lg font-bold" style={{ color: colors.adminWarning }}>
              KSh {vehicleDetails?.performance_metrics.maintenance_cost_per_km}
            </p>
          </div>
          <div className="p-3 rounded-lg border text-center" style={{ borderColor: colors.borderLight }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Downtime</p>
            <p className="text-lg font-bold" style={{ color: colors.adminError }}>
              {vehicleDetails?.performance_metrics.downtime_days} days
            </p>
          </div>
        </div>
      </div>
    </div>
  )

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
        className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              Vehicle Details
            </h2>
            {vehicleDetails && (
              <p style={{ color: colors.textSecondary }}>
                {vehicleDetails.vehicle_info.year} {vehicleDetails.vehicle_info.make} {vehicleDetails.vehicle_info.model} 
                • {vehicleDetails.vehicle_info.registration_number}
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

        {/* Section Tabs */}
        <div className="flex border-b" style={{ borderColor: colors.borderLight }}>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
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
                onClick={loadVehicleDetails}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeSection === 'overview' && renderOverview()}
              {activeSection === 'analytics' && renderAnalytics()}
              {activeSection === 'maintenance' && renderMaintenance()}
              {activeSection === 'documents' && renderDocuments()}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}