'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createVehicle, Vehicle, fetchSuppliers, Supplier, createSupplier } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, AlertTriangle, Car, Building2, Plus, X } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'

export default function VehicleCreatePage() {
  const router = useRouter()

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    status: 'AVAILABLE',
    classification: 'INTERNAL',
    vehicle_type: 'INTERNAL',

  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    contact_person: ''
  })
  const [saving, setSaving] = useState(false)
  const [savingSupplier, setSavingSupplier] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await fetchSuppliers()
        setSuppliers(response.results || [])
      } catch (error) {
        console.error('Error loading suppliers:', error)
        setError('Failed to load suppliers')
      } finally {
        setLoadingSuppliers(false)
      }
    }
    loadSuppliers()
  }, [])

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateSupplier = async () => {
    setSavingSupplier(true)
    setError(null)

    // Validate required fields
    if (!newSupplier.name || !newSupplier.phone) {
      setError('Supplier name and phone are required')
      setSavingSupplier(false)
      return
    }

    try {
      const createdSupplier = await createSupplier(newSupplier)
      setSuppliers(prev => [...prev, createdSupplier])
      handleInputChange('supplier', createdSupplier.id)
      setShowNewSupplierForm(false)
      setNewSupplier({ name: '', phone: '', email: '', address: '', contact_person: '' })
    } catch (error) {
      console.error('Error creating supplier:', error)
      setError('Failed to create supplier. Please try again.')
    } finally {
      setSavingSupplier(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validate required fields
    if (!formData.registration_number || !formData.make || !formData.model || !formData.purchase_price) {
      setError('Please fill in all required fields (Registration Number, Make, Model, Purchase Price)')
      setSaving(false)
      return
    }

    try {
      const newVehicle = await createVehicle(formData)
      router.push(`/admin/fleet-management/${newVehicle.id}`)
    } catch (error: any) {
      console.error('Error creating vehicle:', error)
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          const messages = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
          setError(messages || 'Failed to create vehicle');
        } else {
          setError(String(errorData || 'Failed to create vehicle'));
        }
      } else {
        setError('Failed to create vehicle. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            Add New Vehicle
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Create a new vehicle record in your fleet
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg"
          style={{ backgroundColor: `${colors.adminError}10`, borderColor: colors.adminError, border: '1px solid' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} style={{ color: colors.adminError }} />
            <span style={{ color: colors.adminError }}>{error}</span>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardCard
            title="Basic Information"
            subtitle="Essential vehicle details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registration_number || ''}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="e.g., KCA 123A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Make *
                </label>
                <input
                  type="text"
                  value={formData.make || ''}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="e.g., Corolla"
                  required
                />
              </div>



              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Status
                </label>
                <select
                  value={formData.status || 'AVAILABLE'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="HIRED">Hired</option>
                  <option value="IN_GARAGE">In Garage</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Vehicle Type
                </label>
                <select
                  value={formData.vehicle_type || 'INTERNAL'}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                >
                  <option value="INTERNAL">Internal</option>
                  <option value="EXTERNAL">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color || ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="e.g., White"
                />
              </div>

            </div>
          </DashboardCard>
        </motion.div>

        {/* Technical Specifications */}


        {/* Supplier Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <DashboardCard
            title="Supplier Information"
            subtitle="Select the vehicle supplier"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Supplier
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewSupplierForm(!showNewSupplierForm)}
                    className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: showNewSupplierForm ? colors.adminError : colors.adminPrimary,
                      color: 'white'
                    }}
                  >
                    {showNewSupplierForm ? (
                      <><X size={14} /> Cancel</>
                    ) : (
                      <><Plus size={14} /> New Supplier</>
                    )}
                  </button>
                </div>

                {!showNewSupplierForm ? (
                  <>
                    <select
                      value={formData.supplier as string || ''}
                      onChange={(e) => handleInputChange('supplier', e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.borderLight }}
                      disabled={loadingSuppliers}
                    >
                      <option value="">Select a supplier (optional)</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.supplier_code})
                        </option>
                      ))}
                    </select>
                    {loadingSuppliers && (
                      <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                        Loading suppliers...
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Supplier Name *
                        </label>
                        <input
                          type="text"
                          value={newSupplier.name || ''}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.borderLight }}
                          placeholder="Enter supplier name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={newSupplier.phone || ''}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.borderLight }}
                          placeholder="e.g., +254712345678"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={newSupplier.email || ''}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.borderLight }}
                          placeholder="supplier@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                          Contact Person
                        </label>
                        <input
                          type="text"
                          value={newSupplier.contact_person || ''}
                          onChange={(e) => setNewSupplier(prev => ({ ...prev, contact_person: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.borderLight }}
                          placeholder="Contact person name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: colors.textPrimary }}>
                        Address
                      </label>
                      <textarea
                        value={newSupplier.address || ''}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                        style={{ borderColor: colors.borderLight }}
                        rows={2}
                        placeholder="Physical address"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCreateSupplier}
                        disabled={savingSupplier}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: colors.adminSuccess }}
                      >
                        {savingSupplier ? 'Creating...' : 'Create & Select Supplier'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {formData.supplier && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Supplier Name</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === formData.supplier)?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Supplier Code</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === formData.supplier)?.supplier_code || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Phone</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === formData.supplier)?.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Email</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === formData.supplier)?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Purchase Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <DashboardCard
            title="Purchase Information"
            subtitle="Financial details about the vehicle acquisition"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Purchase Price (KSh) *
                </label>
                <input
                  type="number"
                  value={formData.purchase_price || ''}
                  onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 1500000"
                  required
                />
                <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                  Total amount paid to acquire this vehicle
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Amount Paid (KSh)
                </label>
                <input
                  type="number"
                  value={formData.paid_price || ''}
                  onChange={(e) => handleInputChange('paid_price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.borderLight }}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 750000"
                />
                <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                  Amount already paid (leave empty if fully paid)
                </p>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

        {/* Additional Information */}


        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex justify-end gap-4 pt-6"
        >
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: colors.textSecondary }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Save size={18} />
            {saving ? 'Creating...' : 'Create Vehicle'}
          </button>
        </motion.div>
      </form>
    </div>
  )
}