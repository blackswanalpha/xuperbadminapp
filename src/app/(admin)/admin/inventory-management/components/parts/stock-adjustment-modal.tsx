'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Package, Plus, Minus, RefreshCw } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchPart,
  adjustPartStock,
} from '@/lib/api'
import {
  Part,
  CreateStockAdjustment,
} from '@/types/inventory-api'

interface StockAdjustmentModalProps {
  part: Part
  onClose: () => void
  onAdjust: () => void
}

export default function StockAdjustmentModal({ part, onClose, onAdjust }: StockAdjustmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshedPart, setRefreshedPart] = useState<Part>(part)
  
  // Form data
  const [formData, setFormData] = useState({
    adjustment_type: 'PURCHASE' as 'PURCHASE' | 'RETURN' | 'CORRECTION' | 'DAMAGE' | 'LOSS',
    quantity: '',
    reason: '',
    reference_number: '',
  })

  const adjustmentOptions = [
    { value: 'PURCHASE', label: 'Purchase', type: 'IN', icon: Plus, color: 'green' },
    { value: 'RETURN', label: 'Return', type: 'IN', icon: Plus, color: 'green' },
    { value: 'CORRECTION', label: 'Correction', type: 'BOTH', icon: RefreshCw, color: 'blue' },
    { value: 'DAMAGE', label: 'Damage', type: 'OUT', icon: Minus, color: 'red' },
    { value: 'LOSS', label: 'Loss', type: 'OUT', icon: Minus, color: 'red' },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const refreshPartData = async () => {
    try {
      setLoading(true)
      const updatedPart = await fetchPart(part.id)
      setRefreshedPart(updatedPart)
    } catch (err) {
      console.error('Error refreshing part data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    const selectedOption = adjustmentOptions.find(opt => opt.value === formData.adjustment_type)
    if (selectedOption?.type === 'OUT' && parseInt(formData.quantity) > refreshedPart.current_stock) {
      setError('Cannot adjust more stock out than currently available')
      return
    }
    
    try {
      setSaving(true)
      setError(null)

      const adjustmentData: CreateStockAdjustment = {
        part: parseInt(part.id),
        adjustment_type: formData.adjustment_type,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        reference_number: formData.reference_number || undefined,
      }

      await adjustPartStock(part.id, adjustmentData)
      onAdjust()
      onClose()
    } catch (err) {
      console.error('Error adjusting stock:', err)
      setError('Failed to adjust stock')
    } finally {
      setSaving(false)
    }
  }

  const calculateNewStock = () => {
    const quantity = parseInt(formData.quantity) || 0
    const currentStock = refreshedPart.current_stock
    const selectedOption = adjustmentOptions.find(opt => opt.value === formData.adjustment_type)
    
    if (selectedOption?.type === 'IN') {
      return currentStock + quantity
    } else if (selectedOption?.type === 'OUT') {
      return Math.max(0, currentStock - quantity)
    } else {
      // For CORRECTION type, allow both directions
      return currentStock + quantity
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: colors.adminError }
    }
    if (stock <= refreshedPart.min_stock_level) {
      return { text: 'Low Stock', color: colors.adminWarning }
    }
    return { text: 'In Stock', color: colors.adminSuccess }
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
              Stock Adjustment
            </h2>
            <p style={{ color: colors.textSecondary }}>
              {refreshedPart.name} - {refreshedPart.sku}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshPartData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh current stock"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} style={{ color: colors.textSecondary }} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} style={{ color: colors.textSecondary }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Current Stock Info */}
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
            <h3 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Current Stock Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Current Stock</p>
                <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  {refreshedPart.current_stock} {refreshedPart.unit}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Min Level</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {refreshedPart.min_stock_level} {refreshedPart.unit}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Max Level</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {refreshedPart.max_stock_level} {refreshedPart.unit}
                </p>
              </div>
              <div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Status</p>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getStockStatus(refreshedPart.current_stock).color}20`,
                    color: getStockStatus(refreshedPart.current_stock).color,
                  }}
                >
                  {getStockStatus(refreshedPart.current_stock).text}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.textSecondary }}>
                Adjustment Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {adjustmentOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = formData.adjustment_type === option.value
                  const colorClass = option.color === 'green' ? 'text-green-600' :
                                   option.color === 'red' ? 'text-red-600' : 'text-blue-600'
                  const borderClass = option.color === 'green' ? 'border-green-500 bg-green-50' :
                                     option.color === 'red' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'
                  
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('adjustment_type', option.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected ? borderClass : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className={colorClass} />
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${colorClass}`}>{option.label}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                required
                min="1"
                max={adjustmentOptions.find(opt => opt.value === formData.adjustment_type)?.type === 'OUT' ? refreshedPart.current_stock : undefined}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
                placeholder="Enter quantity"
              />
              {adjustmentOptions.find(opt => opt.value === formData.adjustment_type)?.type === 'OUT' && (
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Maximum available: {refreshedPart.current_stock} {refreshedPart.unit}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Reason *
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
                placeholder="Enter reason for adjustment"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => handleInputChange('reference_number', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
                placeholder="Enter reference number (invoice, ticket, etc.)"
              />
            </div>

            {/* Preview */}
            {formData.quantity && (
              <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: colors.surfaceVariant }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Adjustment Preview
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>Current</p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {refreshedPart.current_stock} {refreshedPart.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Change ({formData.adjustment_type})
                    </p>
                    <p className={`font-semibold ${
                      adjustmentOptions.find(opt => opt.value === formData.adjustment_type)?.type === 'IN' 
                        ? 'text-green-600' 
                        : adjustmentOptions.find(opt => opt.value === formData.adjustment_type)?.type === 'OUT' 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                    }`}>
                      {adjustmentOptions.find(opt => opt.value === formData.adjustment_type)?.type === 'OUT' ? '-' : '+'}
                      {formData.quantity} {refreshedPart.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>New Total</p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {calculateNewStock()} {refreshedPart.unit}
                    </p>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${getStockStatus(calculateNewStock()).color}20`,
                        color: getStockStatus(calculateNewStock()).color,
                      }}
                    >
                      {getStockStatus(calculateNewStock()).text}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderLight }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                <Save size={16} />
                {saving ? 'Adjusting...' : 'Adjust Stock'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}