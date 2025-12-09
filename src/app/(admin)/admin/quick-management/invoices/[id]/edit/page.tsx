'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, FileText } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { mockInvoices } from '@/data/quick-management-mock'
import type { InvoiceLineItem } from '@/types/quick-management'

export default function EditInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Replace with actual API call
  const existingInvoice = mockInvoices.find((inv) => inv.id === invoiceId)

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    invoiceDate: '',
    dueDate: '',
    tax: 0,
    notes: '',
  })

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 },
  ])

  useEffect(() => {
    // TODO: Fetch invoice data from API
    if (existingInvoice) {
      setFormData({
        clientId: existingInvoice.clientId,
        clientName: existingInvoice.clientName,
        invoiceDate: existingInvoice.date,
        dueDate: existingInvoice.dueDate,
        tax: existingInvoice.tax,
        notes: '',
      })
      setLineItems(existingInvoice.lineItems)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      alert('Invoice not found')
      router.push('/dashboard/quick-management?tab=invoices')
    }
  }, [invoiceId])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    // TODO: Implement API call to update invoice
    setTimeout(() => {
      setIsSaving(false)
      alert('Invoice updated successfully!')
      router.push('/dashboard/quick-management?tab=invoices')
    }, 1000)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      // TODO: Implement delete API call
      alert('Invoice deleted successfully!')
      router.push('/dashboard/quick-management?tab=invoices')
    }
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      router.push('/dashboard/quick-management?tab=invoices')
    }
  }

  if (isLoading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <p style={{ color: colors.textSecondary }}>Loading invoice...</p>
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
                Edit Invoice {invoiceId}
              </h1>
              <p style={{ color: colors.textSecondary }}>Update invoice details</p>
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

        {/* Same form as Create Invoice - reusing the structure */}
        <form onSubmit={handleSubmit}>
          {/* Invoice Details Card - Same as Create */}
          <DashboardCard title="Invoice Details" className="mb-6">
            {/* Form fields same as create page */}
            <div className="text-center py-8" style={{ color: colors.textTertiary }}>
              <p>Form fields identical to Create Invoice page</p>
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
              style={{ backgroundColor: colors.adminPrimary }}
            >
              <Save size={18} />
              {isSaving ? 'Updating...' : 'Update Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    
  )
}

