'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Package, Tag, MapPin } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchPart,
  updatePart,
  fetchPartCategories,
  fetchInventorySuppliers,
} from '@/lib/api'
import {
  Part,
  PartCategory,
  InventorySupplier,
} from '@/types/inventory-api'

interface EditPartModalProps {
  partId: string
  onClose: () => void
  onUpdate: () => void
}

export default function EditPartModal({ partId, onClose, onUpdate }: EditPartModalProps) {
  const [part, setPart] = useState<Part | null>(null)
  const [categories, setCategories] = useState<PartCategory[]>([])
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    supplier: '',
    unit: 'PIECE',
    unit_cost: '',
    min_stock_level: '',
    max_stock_level: '',
    location: '',
  })

  useEffect(() => {
    loadData()
  }, [partId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [partData, categoriesResponse, suppliersResponse] = await Promise.all([
        fetchPart(partId),
        fetchPartCategories(),
        fetchInventorySuppliers(),
      ])

      setPart(partData)
      setCategories(categoriesResponse.results)
      setSuppliers(suppliersResponse.results)

      // Populate form data
      setFormData({
        name: partData.name || '',
        description: partData.description || '',
        sku: partData.sku || '',
        category: partData.category?.toString() || '',
        supplier: partData.supplier?.toString() || '',
        unit: partData.unit || 'PIECE',
        unit_cost: partData.unit_cost || '',
        min_stock_level: partData.min_stock_level?.toString() || '',
        max_stock_level: partData.max_stock_level?.toString() || '',
        location: partData.location || '',
      })
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load part details')
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
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        category: formData.category ? parseInt(formData.category) : null,
        supplier: formData.supplier ? parseInt(formData.supplier) : null,
        unit: formData.unit as 'PIECE' | 'SET' | 'LITER' | 'KILOGRAM' | 'METER' | 'PAIR',
        unit_cost: formData.unit_cost || '0',
        min_stock_level: formData.min_stock_level ? parseInt(formData.min_stock_level) : 0,
        max_stock_level: formData.max_stock_level ? parseInt(formData.max_stock_level) : 0,
        location: formData.location || null,
      }

      await updatePart(partId, updateData)
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error updating part:', err)
      setError('Failed to update part')
    } finally {
      setSaving(false)
    }
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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: colors.textPrimary }}>
              <Package size={24} />
              Edit Part
            </h2>
            {part && (
              <p style={{ color: colors.textSecondary }}>
                {part.name} - {part.sku}
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
                  <MapPin size={20} />
                  Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Enter storage location (e.g., Warehouse A, Shelf 1)"
                  />
                </div>
              </div>

              {/* Current Stock Info (Read-only) */}
              {part && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    Current Stock Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Current Stock</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {part.current_stock} {part.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Stock Value</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        KSh {parseFloat(part.stock_value || '0').toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Stock Status</p>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: part.is_low_stock ? `${colors.adminWarning}20` : `${colors.adminSuccess}20`,
                          color: part.is_low_stock ? colors.adminWarning : colors.adminSuccess,
                        }}
                      >
                        {part.is_low_stock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
                    Note: To adjust current stock levels, use the Stock Adjustment feature.
                  </p>
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
                  {saving ? 'Updating...' : 'Update Part'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}