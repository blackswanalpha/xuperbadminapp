'use client'

import { motion } from 'framer-motion'
import { X, Package, User, Calendar, Hash, MapPin, DollarSign } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { StockUsage } from '@/types/inventory-api'

interface ViewStockUsageModalProps {
  usage: StockUsage
  onClose: () => void
}

export default function ViewStockUsageModal({ usage, onClose }: ViewStockUsageModalProps) {
  const getUsageTypeColor = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SALE':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INTERNAL':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DAMAGE':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return '🔧'
      case 'SALE':
        return '💰'
      case 'INTERNAL':
        return '🏢'
      case 'DAMAGE':
        return '⚠️'
      default:
        return '📦'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Package size={24} />
              Stock Usage Details
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Usage ID: {usage.id}
            </p>
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
            {/* Usage Type and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getUsageTypeIcon(usage.usage_type)}</span>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getUsageTypeColor(usage.usage_type)}`}
                  >
                    {usage.usage_type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Recorded on
                </p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {formatDate(usage.created_at)}
                </p>
              </div>
            </div>

            {/* Part Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Package size={20} />
                Part Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                <div>
                  <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>Part Name</p>
                  <p className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
                    {usage.part_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>SKU</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {usage.part_sku || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>Unit</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {usage.unit || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>Unit Cost</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    KSh {parseFloat(usage.unit_cost || '0').toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <User size={20} />
                Usage Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} style={{ color: colors.textSecondary }} />
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Usage Date</p>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {formatDate(usage.used_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User size={16} style={{ color: colors.textSecondary }} />
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Used By</p>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {usage.used_by || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {usage.reference_number && (
                    <div className="flex items-center gap-3">
                      <Hash size={16} style={{ color: colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Reference Number</p>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {usage.reference_number}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Package size={16} style={{ color: colors.textSecondary }} />
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Quantity Used</p>
                      <p className="font-semibold text-lg" style={{ color: colors.adminPrimary }}>
                        {usage.quantity_used} {usage.unit || 'units'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign size={16} style={{ color: colors.textSecondary }} />
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Total Cost</p>
                      <p className="font-semibold text-lg" style={{ color: colors.adminSuccess }}>
                        KSh {parseFloat(usage.total_cost || '0').toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {usage.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} style={{ color: colors.textSecondary }} />
                      <div>
                        <p className="text-sm" style={{ color: colors.textSecondary }}>Location</p>
                        <p className="font-semibold" style={{ color: colors.textPrimary }}>
                          {usage.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <DollarSign size={20} />
                Cost Breakdown
              </h3>
              <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.surfaceVariant }}>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Unit Cost</p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      KSh {parseFloat(usage.unit_cost || '0').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Quantity</p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {usage.quantity_used}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Total</p>
                    <p className="font-semibold text-lg" style={{ color: colors.adminSuccess }}>
                      KSh {parseFloat(usage.total_cost || '0').toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {usage.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Hash size={20} />
                  Notes
                </h3>
                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                  <p style={{ color: colors.textPrimary }}>
                    {usage.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                <Calendar size={20} />
                Record Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p style={{ color: colors.textSecondary }}>Created At</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {formatDate(usage.created_at)}
                  </p>
                </div>
                <div>
                  <p style={{ color: colors.textSecondary }}>Last Updated</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {usage.updated_at ? formatDate(usage.updated_at) : 'Never'}
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