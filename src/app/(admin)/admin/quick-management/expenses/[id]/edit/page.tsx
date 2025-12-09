'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Wrench, Upload, Trash2 } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { mockExpenses } from '@/data/quick-management-mock'
import type { ExpenseCategory, ExpenseStatus } from '@/types/quick-management'

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Replace with actual API call
  const existingExpense = mockExpenses.find((exp) => exp.id === expenseId)

  const [formData, setFormData] = useState({
    category: '' as ExpenseCategory | '',
    vehicleId: '',
    vehicleName: '',
    description: '',
    amount: 0,
    status: 'Pending' as ExpenseStatus,
    date: '',
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

  useEffect(() => {
    // TODO: Fetch expense data from API
    if (existingExpense) {
      setFormData({
        category: existingExpense.category,
        vehicleId: existingExpense.vehicleId,
        vehicleName: existingExpense.vehicleName,
        description: existingExpense.description,
        amount: existingExpense.amount,
        status: existingExpense.status,
        date: existingExpense.date,
        receiptFile: null,
      })
      setIsLoading(false)
    } else {
      setIsLoading(false)
      alert('Expense not found')
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }, [expenseId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    // TODO: Implement API call to update expense
    setTimeout(() => {
      setIsSaving(false)
      alert('Expense updated successfully!')
      router.push('/dashboard/quick-management?tab=expenses')
    }, 1000)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      // TODO: Implement delete API call
      alert('Expense deleted successfully!')
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }

  if (isLoading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <p style={{ color: colors.textSecondary }}>Loading expense...</p>
        </div>
      
    )
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
                Edit Expense {expenseId}
              </h1>
              <p style={{ color: colors.textSecondary }}>Update expense details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-red-50 transition-colors"
              style={{ borderColor: colors.adminError, color: colors.adminError }}
            >
              <Trash2 size={18} />
              Delete
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

        {/* Same form as Create Expense - reusing the structure */}
        <form onSubmit={handleSubmit}>
          {/* Expense Details Card - Same as Create */}
          <DashboardCard title="Expense Details" className="mb-6">
            {/* Form fields same as create page */}
            <div className="text-center py-8" style={{ color: colors.textTertiary }}>
              <p>Form fields identical to Create Expense page</p>
              <p className="text-sm mt-2">(Implementation matches create page structure)</p>
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
              <Save size={18} />
              {isSaving ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    
  )
}

