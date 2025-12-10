'use client'

import { motion } from 'framer-motion'
import {
  X,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  Star,
  Package,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { InventorySupplier } from '@/types/inventory-api'

interface ViewSupplierModalProps {
  supplier: InventorySupplier
  onClose: () => void
}

export default function ViewSupplierModal({ supplier, onClose }: ViewSupplierModalProps) {
  const getSupplierRating = () => {
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
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>
          ({rating}/5)
        </span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getOnTimePercentage = () => {
    if (supplier.total_orders === 0) return 0
    return Math.round((supplier.on_time_deliveries / supplier.total_orders) * 100)
  }

  const getQualityPercentage = () => {
    if (supplier.total_orders === 0) return 100
    return Math.round((1 - (supplier.quality_issues / supplier.total_orders)) * 100)
  }

  const rating = getSupplierRating()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 content-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
                {supplier.name}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${supplier.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    supplier.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                  }`}
              >
                {supplier.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} style={{ color: colors.textSecondary }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={20} className="text-blue-600" />
                  <span className="font-medium text-blue-800">Total Orders</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {supplier.total_orders?.toLocaleString() || 0}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-green-600" />
                  <span className="font-medium text-green-800">On-Time Delivery</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {getOnTimePercentage()}%
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={20} className="text-purple-600" />
                  <span className="font-medium text-purple-800">Quality Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {getQualityPercentage()}%
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package size={20} className="text-orange-600" />
                  <span className="font-medium text-orange-800">Parts Supplied</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {supplier.parts_supplied?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                  Overall Performance Rating
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Based on delivery performance and quality metrics
                </p>
              </div>
              {renderStarRating(rating)}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <User size={20} />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Contact Person</p>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {supplier.contact_person}
                        </p>
                      </div>
                    </div>
                  )}

                  {supplier.contact_email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Mail size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Email Address</p>
                        <a
                          href={`mailto:${supplier.contact_email}`}
                          className="font-semibold hover:underline"
                          style={{ color: colors.adminPrimary }}
                        >
                          {supplier.contact_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {supplier.contact_phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Phone size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Phone Number</p>
                        <a
                          href={`tel:${supplier.contact_phone}`}
                          className="font-semibold hover:underline"
                          style={{ color: colors.adminPrimary }}
                        >
                          {supplier.contact_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {supplier.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Globe size={16} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Website</p>
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold hover:underline"
                          style={{ color: colors.adminPrimary }}
                        >
                          {supplier.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {supplier.payment_terms && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <FileText size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Payment Terms</p>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {supplier.payment_terms}
                        </p>
                      </div>
                    </div>
                  )}

                  {supplier.tax_number && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText size={16} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Tax Number</p>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {supplier.tax_number}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            {(supplier.address || supplier.city || supplier.country) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <MapPin size={20} />
                  Address Information
                </h3>
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} style={{ color: colors.textSecondary }} className="mt-1" />
                    <div>
                      {supplier.address && (
                        <p className="font-medium" style={{ color: colors.textPrimary }}>
                          {supplier.address}
                        </p>
                      )}
                      {(supplier.city || supplier.country) && (
                        <p style={{ color: colors.textSecondary }}>
                          {[supplier.city, supplier.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <TrendingUp size={20} />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1" style={{ color: colors.adminSuccess }}>
                      {supplier.on_time_deliveries || 0}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      On-Time Deliveries
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1" style={{ color: colors.adminWarning }}>
                      {supplier.quality_issues || 0}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Quality Issues
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1" style={{ color: colors.adminPrimary }}>
                      {supplier.average_lead_time || 0}
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Avg. Lead Time (days)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {supplier.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <FileText size={20} />
                  Notes
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                  <p style={{ color: colors.textPrimary }}>
                    {supplier.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Quality Alerts */}
            {supplier.quality_issues > 0 && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <h4 className="font-semibold text-red-800">Quality Alert</h4>
                </div>
                <p className="text-red-700 text-sm">
                  This supplier has {supplier.quality_issues} reported quality issues out of {supplier.total_orders} total orders.
                  Consider reviewing their quality assurance processes.
                </p>
              </div>
            )}

            {/* Record Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Calendar size={20} />
                Record Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p style={{ color: colors.textSecondary }}>Created</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {formatDate(supplier.created_at)}
                  </p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Last Updated</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {formatDate(supplier.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t" style={{ borderColor: colors.borderLight }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}