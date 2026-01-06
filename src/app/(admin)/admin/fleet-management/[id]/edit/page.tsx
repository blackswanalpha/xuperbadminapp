'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchVehicle, updateVehicle, Vehicle, fetchSuppliers, Supplier } from '@/lib/api'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'

export default function VehicleEditPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleId = parseInt(params.id as string)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<Partial<Vehicle>>({})
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehicleData, suppliersData] = await Promise.all([
          fetchVehicle(vehicleId),
          fetchSuppliers()
        ])
        setVehicle(vehicleData)
        setFormData(vehicleData)
        setSuppliers(suppliersData.results || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setLoading(false)
        setLoadingSuppliers(false)
      }
    }

    loadData()
  }, [vehicleId])

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updatedVehicle = await updateVehicle(vehicleId, formData)
      setVehicle(updatedVehicle)
      router.push(`/admin/fleet-management/${vehicleId}`)
    } catch (error) {
      console.error('Error updating vehicle:', error)
      setError('Failed to update vehicle. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p style={{ color: colors.textSecondary }}>Loading vehicle data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !vehicle) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertTriangle size={48} style={{ color: colors.adminError }} className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
              Error Loading Vehicle
            </h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              {error}
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
              Edit Vehicle
            </h1>
            <p style={{ color: colors.textSecondary }}>
              {vehicle?.make} {vehicle?.model} - {vehicle?.registration_number}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${colors.adminError}10`, borderColor: colors.adminError, border: '1px solid' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} style={{ color: colors.adminError }} />
            <span style={{ color: colors.adminError }}>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
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
                required
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Status
              </label>
              <select
                value={formData.status || ''}
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
                Classification
              </label>
              <select
                value={formData.classification || ''}
                onChange={(e) => handleInputChange('classification', e.target.value)}
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
              />
            </div>

          </div>
        </DashboardCard>



        {/* Supplier Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <DashboardCard
            title="Supplier Information"
            subtitle="Vehicle supplier details"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Supplier
                </label>
                <select
                  value={typeof formData.supplier === 'string' ? formData.supplier : formData.supplier?.id || ''}
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
              </div>

              {formData.supplier && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Supplier Name</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === (typeof formData.supplier === 'string' ? formData.supplier : formData.supplier?.id))?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Supplier Code</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === (typeof formData.supplier === 'string' ? formData.supplier : formData.supplier?.id))?.supplier_code || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Phone</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === (typeof formData.supplier === 'string' ? formData.supplier : formData.supplier?.id))?.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.textSecondary }}>Email</span>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {suppliers.find(s => s.id === (typeof formData.supplier === 'string' ? formData.supplier : formData.supplier?.id))?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Purchase Information */}
        <DashboardCard
          title="Purchase Information"
          subtitle="Supplier and purchase details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Purchase Price (KSh)
              </label>
              <input
                type="number"
                value={formData.purchase_price || ''}
                onChange={(e) => handleInputChange('purchase_price', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: colors.borderLight }}
                min="0"
                step="0.01"
              />
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
              />
            </div>
          </div>
        </DashboardCard>



        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}