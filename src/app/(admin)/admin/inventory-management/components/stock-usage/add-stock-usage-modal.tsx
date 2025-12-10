'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Package, User, Calendar, Hash } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  createStockUsage,
  fetchParts,
} from '@/lib/api'
import {
  Part,
  CreateStockUsage,
} from '@/types/inventory-api'

interface AddStockUsageModalProps {
  onClose: () => void
  onAdd: () => void
}

export default function AddStockUsageModal({ onClose, onAdd }: AddStockUsageModalProps) {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    part: '',
    usage_type: 'MAINTENANCE' as 'MAINTENANCE' | 'SALE' | 'INTERNAL' | 'DAMAGE',
    quantity_used: '',
    used_by: '',
    used_at: new Date().toISOString().split('T')[0],
    reference_number: '',
    notes: '',
  })

  const usageTypes = [
    { value: 'MAINTENANCE', label: 'Maintenance', description: 'Used for vehicle maintenance' },
    { value: 'SALE', label: 'Sale', description: 'Sold to customer' },
    { value: 'INTERNAL', label: 'Internal Use', description: 'Used internally by company' },
    { value: 'DAMAGE', label: 'Damage/Loss', description: 'Damaged or lost parts' },
  ]

  useEffect(() => {
    loadParts()
  }, [])

  const loadParts = async () => {
    try {
      setLoading(true)
      setError(null)

      const partsResponse = await fetchParts()
      setParts(partsResponse.results.filter(part => part.current_stock > 0))
    } catch (err) {
      console.error('Error loading parts:', err)
      setError('Failed to load available parts')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Update selected part when part changes
    if (field === 'part' && value) {
      const part = parts.find(p => p.id === value)
      setSelectedPart(part || null)
    }
  }

  const calculateTotalCost = () => {
    if (!selectedPart || !formData.quantity_used) return 0
    return parseFloat(selectedPart.unit_cost || '0') * parseInt(formData.quantity_used)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPart) {
      setError('Please select a part')
      return
    }

    const quantityUsed = parseInt(formData.quantity_used)
    if (quantityUsed > selectedPart.current_stock) {
      setError(`Cannot use more than available stock (${selectedPart.current_stock} ${selectedPart.unit})`)
      return
    }

    try {
      setSaving(true)
      setError(null)

      const usageData: CreateStockUsage = {
        part: parseInt(formData.part),
        usage_type: formData.usage_type,
        quantity_used: quantityUsed,
        used_by: formData.used_by,
        used_at: formData.used_at,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
      }

      await createStockUsage(usageData)
      onAdd()
      onClose()
    } catch (err) {
      console.error('Error creating stock usage:', err)
      setError('Failed to record stock usage')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Package size={24} />
              Record Stock Usage
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Track parts consumption and usage patterns
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadParts}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Part Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Package size={20} />
                  Part Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Select Part *
                    </label>
                    <select
                      value={formData.part}
                      onChange={(e) => handleInputChange('part', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="">Select a part...</option>
                      {parts.map((part) => (
                        <option key={part.id} value={part.id}>
                          {part.name} - {part.sku} (Stock: {part.current_stock} {part.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPart && (
                    <div className="md:col-span-2 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                      <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                        Selected Part Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p style={{ color: colors.textSecondary }}>Current Stock</p>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            {selectedPart.current_stock} {selectedPart.unit}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.textSecondary }}>Unit Cost</p>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            KSh {parseFloat(selectedPart.unit_cost || '0').toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.textSecondary }}>Location</p>
                          <p className="font-semibold" style={{ color: colors.textPrimary }}>
                            {selectedPart.location || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: colors.textSecondary }}>Status</p>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: selectedPart.is_low_stock ? `${colors.adminWarning}20` : `${colors.adminSuccess}20`,
                              color: selectedPart.is_low_stock ? colors.adminWarning : colors.adminSuccess,
                            }}
                          >
                            {selectedPart.is_low_stock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Usage Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <User size={20} />
                  Usage Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Usage Type *
                    </label>
                    <select
                      value={formData.usage_type}
                      onChange={(e) => handleInputChange('usage_type', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      {usageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                      {usageTypes.find(t => t.value === formData.usage_type)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Quantity Used *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_used}
                      onChange={(e) => handleInputChange('quantity_used', e.target.value)}
                      required
                      min="1"
                      max={selectedPart?.current_stock || 999}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Enter quantity"
                    />
                    {selectedPart && (
                      <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        Available: {selectedPart.current_stock} {selectedPart.unit}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Used By *
                    </label>
                    <input
                      type="text"
                      value={formData.used_by}
                      onChange={(e) => handleInputChange('used_by', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Name or department"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Usage Date *
                    </label>
                    <input
                      type="date"
                      value={formData.used_at}
                      onChange={(e) => handleInputChange('used_at', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Hash size={20} />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => handleInputChange('reference_number', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Job number, ticket ID, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Cost Summary
                    </label>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Total Cost: <span className="font-semibold text-lg" style={{ color: colors.adminPrimary }}>
                          KSh {calculateTotalCost().toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Additional notes or details"
                    />
                  </div>
                </div>
              </div>

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
                  {saving ? 'Recording...' : 'Record Usage'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}