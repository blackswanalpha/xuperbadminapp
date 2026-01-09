'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Package, Tag, MapPin } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  createPart,
  fetchInventorySuppliers,
} from '@/lib/api'
import {
  InventorySupplier,
} from '@/types/inventory-api'

interface AddPartModalProps {
  onClose: () => void
  onAdd: () => void
}

export default function AddPartModal({ onClose, onAdd }: AddPartModalProps) {
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    supplier: '',
    unit: 'PIECE',
    unit_cost: '',
    min_stock_level: '',
    max_stock_level: '',
    current_stock: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const suppliersResponse = await fetchInventorySuppliers()

      setSuppliers(suppliersResponse.results)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load suppliers')
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

      const partData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        supplier: formData.supplier ? parseInt(formData.supplier) : null,
        unit: formData.unit as 'PIECE' | 'SET' | 'LITER' | 'KILOGRAM' | 'METER' | 'PAIR',
        unit_cost: formData.unit_cost || '0',
        min_stock_level: formData.min_stock_level ? parseInt(formData.min_stock_level) : 0,
        max_stock_level: formData.max_stock_level ? parseInt(formData.max_stock_level) : 0,
        current_stock: formData.current_stock ? parseInt(formData.current_stock) : 0,
      }

      await createPart(partData)
      onAdd()
      onClose()
    } catch (err) {
      console.error('Error creating part:', err)
      setError('Failed to create part')
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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Package size={24} />
              Add New Part
            </h2>
            <p style={{ color: colors.textSecondary }}>
              Create a new part in the inventory system
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
                  <Tag size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Part Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Enter part name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Enter part description"
                    />
                  </div>
                </div>
              </div>

              {/* Category and Supplier */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Package size={20} />
                  Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Supplier
                    </label>
                    <select
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="PIECE">Piece</option>
                      <option value="SET">Set</option>
                      <option value="LITER">Liter</option>
                      <option value="KILOGRAM">Kilogram</option>
                      <option value="METER">Meter</option>
                      <option value="PAIR">Pair</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <Package size={20} />
                  Stock & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Unit Cost (KSh) *
                    </label>
                    <input
                      type="number"
                      value={formData.unit_cost}
                      onChange={(e) => handleInputChange('unit_cost', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => handleInputChange('current_stock', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Min Stock Level *
                    </label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => handleInputChange('min_stock_level', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Max Stock Level *
                    </label>
                    <input
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => handleInputChange('max_stock_level', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="0"
                    />
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
                  {saving ? 'Creating...' : 'Create Part'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}