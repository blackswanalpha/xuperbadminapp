'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import type { InvoiceLineItem } from '@/types/quick-management'

export default function CreateInvoicePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    tax: 0,
    notes: '',
  })

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 },
  ])

  const calculateLineItemAmount = (quantity: number, rate: number) => quantity * rate

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + formData.tax
  }

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = calculateLineItemAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate
      )
    }

    setLineItems(updatedItems)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required'
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    if (lineItems.some((item) => !item.description.trim())) {
      newErrors.lineItems = 'All line items must have a description'
    }
    if (lineItems.some((item) => item.quantity <= 0 || item.rate <= 0)) {
      newErrors.lineItems = 'All line items must have valid quantity and rate'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
    // TODO: Implement API call to create invoice
    setTimeout(() => {
      setIsSaving(false)
      alert('Invoice created successfully!')
      router.push('/dashboard/quick-management?tab=invoices')
    }, 1000)
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/dashboard/quick-management?tab=invoices')
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
                Create Invoice
              </h1>
              <p style={{ color: colors.textSecondary }}>Fill in the details to create a new invoice</p>
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
          {/* Invoice Details */}
          <DashboardCard title="Invoice Details" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Client Name <span style={{ color: colors.adminError }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.clientName ? colors.adminError : colors.borderLight }}
                  placeholder="Enter client name"
                />
                {errors.clientName && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.clientName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Invoice Date <span style={{ color: colors.adminError }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Due Date <span style={{ color: colors.adminError }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: errors.dueDate ? colors.adminError : colors.borderLight }}
                  placeholder="Select due date"
                />
                {errors.dueDate && (
                  <p className="text-sm mt-1" style={{ color: colors.adminError }}>
                    {errors.dueDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                  Tax Amount (KSh)
                </label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </DashboardCard>

          {/* Line Items */}
          <DashboardCard
            title="Line Items"
            subtitle={errors.lineItems}
            action={
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: colors.adminPrimary, color: 'white' }}
              >
                <Plus size={16} />
                Add Item
              </button>
            }
            className="mb-6"
          >
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="grid grid-cols-12 gap-4 items-start p-4 rounded-lg border"
                  style={{ borderColor: colors.borderLight }}
                >
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                      style={{ borderColor: colors.borderLight }}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                      style={{ borderColor: colors.borderLight }}
                      min="1"
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      Rate (KSh)
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                      style={{ borderColor: colors.borderLight }}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2">
                    <label className="block text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                      Amount
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      KSh {item.amount.toLocaleString()}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-end justify-center">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      <Trash2 size={16} style={{ color: colors.adminError }} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textSecondary }}>Subtotal:</span>
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>
                    KSh {calculateSubtotal().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textSecondary }}>Tax:</span>
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>
                    KSh {formData.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: colors.borderLight }}>
                  <span className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                    Total:
                  </span>
                  <span className="font-bold text-xl" style={{ color: colors.adminPrimary }}>
                    KSh {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
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
              style={{ backgroundColor: colors.adminPrimary }}
            >
              <FileText size={18} />
              {isSaving ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    
  )
}


