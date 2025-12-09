'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Wrench, Upload } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import type { ExpenseCategory, ExpenseStatus } from '@/types/quick-management'

export default function CreateExpensePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    category: '' as ExpenseCategory | '',
    vehicleId: '',
    vehicleName: '',
    description: '',
    amount: 0,
    status: 'Pending' as ExpenseStatus,
    date: new Date().toISOString().split('T')[0],
    receiptFile: null as File | null,
  })

  const categories: ExpenseCategory[] = ['Service', 'Bodywork', 'Mechanical']
  const statuses: ExpenseStatus[] = ['Pending', 'Approved', 'Rejected']

  // Mock vehicles - TODO: Replace with API call
  const vehicles = [
    { id: 'VEH-001', name: 'Toyota Corolla (KAA 123A)' },
    { id: 'VEH-002', name: 'Honda Civic (KBB 456B)' },
    { id: 'VEH-003', name: 'Nissan Altima (KCC 789C)' },
    { id: 'VEH-004', name: 'Mazda CX-5 (KDD 012D)' },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Vehicle is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receiptFile: e.target.files[0] })
    }
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    // TODO: Implement API call to save draft
    setTimeout(() => {
      setIsSaving(false)
      alert('Draft saved successfully!')
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    // TODO: Implement API call to create expense
    setTimeout(() => {
      setIsSaving(false)
      alert('Expense created successfully!')
      router.push('/dashboard/quick-management?tab=expenses')
    }, 1000)
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Create Expense
              </h1>
              <p style={{ color: colors.textSecondary }}>Fill in the details to create a new expense</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ borderColor: colors.borderMedium, color: colors.textPrimary }}
            >
              <Save size={18} />
              Save Draft
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderMedium, color: colors.textSecondary }}
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Expense Details */}
          <DashboardCard title="Expense Details" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Category <span style={{ color: colors.adminError }}>*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.category ? colors.adminError : colors.borderLight }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Vehicle <span style={{ color: colors.adminError }}>*</span>
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => {
                    const vehicle = vehicles.find((v) => v.id === e.target.value)
                    setFormData({
                      ...formData,
                      vehicleId: e.target.value,
                      vehicleName: vehicle?.name || '',
                    })
                  }}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.vehicleId ? colors.adminError : colors.borderLight }}
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.vehicleId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Amount (KSh) <span style={{ color: colors.adminError }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.amount ? colors.adminError : colors.borderLight }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.amount && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Date <span style={{ color: colors.adminError }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.date ? colors.adminError : colors.borderLight }}
                />
                {errors.date && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Receipt Upload
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <Upload size={18} style={{ color: colors.textSecondary }} />
                    <span style={{ color: colors.textSecondary }}>
                      {formData.receiptFile ? formData.receiptFile.name : 'Choose file'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Description <span style={{ color: colors.adminError }}>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: errors.description ? colors.adminError : colors.borderLight }}
                placeholder="Describe the expense..."
                rows={4}
              />
              {errors.description && (
                <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                  {errors.description}
                </p>
              )}
            </div>
          </DashboardCard>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderMedium, color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors.adminSuccess }}
            >
              <Wrench size={18} />
              {isSaving ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    
  )
}

