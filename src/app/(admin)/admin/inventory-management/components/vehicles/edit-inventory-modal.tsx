'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, MapPin, Calendar, DollarSign } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventoryItem,
  updateInventoryItem,
  fetchInventoryLocations,
} from '@/lib/api'
import {
  InventoryItem,
} from '@/types/inventory-api'

interface EditInventoryModalProps {
  vehicleId: number
  onClose: () => void
  onUpdate: () => void
}

export default function EditInventoryModal({ vehicleId, onClose, onUpdate }: EditInventoryModalProps) {
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    condition: '',
    location: '',
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    maintenance_cost: '',
    last_inspection: '',
    next_inspection: '',
  })

  useEffect(() => {
    loadData()
  }, [vehicleId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [itemData, locationsData] = await Promise.all([
        fetchInventoryItem(vehicleId),
        fetchInventoryLocations(),
      ])

      setInventoryItem(itemData)
      setLocations(locationsData.locations)

      // Populate form data
      setFormData({
        condition: itemData.condition || '',
        location: itemData.location || '',
        purchase_date: itemData.purchase_date || '',
        purchase_price: itemData.purchase_price || '',
        current_value: itemData.current_value || '',
        maintenance_cost: itemData.maintenance_cost || '',
        last_inspection: itemData.last_inspection || '',
        next_inspection: itemData.next_inspection || '',
      })
    } catch (err) {
      console.error('Error loading inventory item:', err)
      setError('Failed to load inventory item details')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const updateData = {
        condition: formData.condition as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
        location: formData.location,
        purchase_date: formData.purchase_date || null,
        purchase_price: formData.purchase_price || null,
        current_value: formData.current_value || null,
        maintenance_cost: formData.maintenance_cost || null,
        last_inspection: formData.last_inspection || null,
        next_inspection: formData.next_inspection || null,
      }

      await updateInventoryItem(vehicleId, updateData)
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error updating inventory item:', err)
      setError('Failed to update inventory item')
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
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              Edit Inventory Item
            </h2>
            {inventoryItem && (
              <p style={{ color: colors.textSecondary }}>
                {inventoryItem.registration_number} - {inventoryItem.year} {inventoryItem.make} {inventoryItem.model}
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
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <MapPin size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="">Select Condition</option>
                      <option value="EXCELLENT">Excellent</option>
                      <option value="GOOD">Good</option>
                      <option value="FAIR">Fair</option>
                      <option value="POOR">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Location *
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <DollarSign size={20} />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Purchase Price (KSh)
                    </label>
                    <input
                      type="number"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Current Value (KSh)
                    </label>
                    <input
                      type="number"
                      value={formData.current_value}
                      onChange={(e) => handleInputChange('current_value', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Maintenance Cost (KSh)
                    </label>
                    <input
                      type="number"
                      value={formData.maintenance_cost}
                      onChange={(e) => handleInputChange('maintenance_cost', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Calendar size={20} />
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Last Inspection
                      </label>
                      <input
                        type="date"
                        value={formData.last_inspection}
                        onChange={(e) => handleInputChange('last_inspection', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Next Inspection
                      </label>
                      <input
                        type="date"
                        value={formData.next_inspection}
                        onChange={(e) => handleInputChange('next_inspection', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}