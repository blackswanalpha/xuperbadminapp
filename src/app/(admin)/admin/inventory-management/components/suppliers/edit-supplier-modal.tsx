'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Building, User, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  fetchInventorySupplier,
  updateInventorySupplier,
} from '@/lib/api'
import {
  InventorySupplier,
} from '@/types/inventory-api'

interface EditSupplierModalProps {
  supplierId: string
  onClose: () => void
  onUpdate: () => void
}

export default function EditSupplierModal({ supplierId, onClose, onUpdate }: EditSupplierModalProps) {
  const [supplier, setSupplier] = useState<InventorySupplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: '',
    website: '',
    tax_number: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING',
    payment_terms: '',
    notes: '',
  })

  useEffect(() => {
    loadSupplier()
  }, [supplierId])

  const loadSupplier = async () => {
    try {
      setLoading(true)
      setError(null)

      const supplierData = await fetchInventorySupplier(supplierId)
      setSupplier(supplierData)

      // Populate form data
      setFormData({
        name: supplierData.name || '',
        contact_person: supplierData.contact_person || '',
        contact_email: supplierData.contact_email || '',
        contact_phone: supplierData.contact_phone || '',
        address: supplierData.address || '',
        city: supplierData.city || '',
        country: supplierData.country || '',
        website: supplierData.website || '',
        tax_number: supplierData.tax_number || '',
        status: supplierData.status || 'ACTIVE',
        payment_terms: supplierData.payment_terms || '',
        notes: supplierData.notes || '',
      })
    } catch (err) {
      console.error('Error loading supplier:', err)
      setError('Failed to load supplier details')
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
        contact_person: formData.contact_person || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || null,
        website: formData.website || null,
        tax_number: formData.tax_number || null,
        status: formData.status,
        payment_terms: formData.payment_terms || null,
        notes: formData.notes || null,
      }

      await updateInventorySupplier(supplierId, updateData)
      onUpdate()
      onClose()
    } catch (err) {
      console.error('Error updating supplier:', err)
      setError('Failed to update supplier')
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
              <Building size={24} />
              Edit Supplier
            </h2>
            {supplier && (
              <p style={{ color: colors.textSecondary }}>
                {supplier.name}
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
                onClick={loadSupplier}
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
                  <Building size={20} />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Enter supplier company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="PENDING">Pending Approval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={formData.payment_terms}
                      onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="e.g., Net 30, COD, 2/10 Net 30"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <User size={20} />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Primary contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="contact@supplier.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="+254 xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="https://supplier.com"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <MapPin size={20} />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Street address, building, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                  <FileText size={20} />
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Tax Number / Registration
                    </label>
                    <input
                      type="text"
                      value={formData.tax_number}
                      onChange={(e) => handleInputChange('tax_number', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Tax ID, VAT number, or business registration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Additional notes about this supplier"
                    />
                  </div>
                </div>
              </div>

              {/* Performance Metrics (Read-only) */}
              {supplier && (
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.surfaceVariant }}>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Total Orders</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {supplier.total_orders || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Parts Supplied</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {supplier.parts_supplied || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>On-Time Deliveries</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {supplier.on_time_deliveries || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>Quality Issues</p>
                      <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {supplier.quality_issues || 0}
                      </p>
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
                  {saving ? 'Updating...' : 'Update Supplier'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}