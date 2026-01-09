'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Send,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Printer,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchInvoice, deleteInvoice, Invoice } from '@/lib/api'

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchInvoice(invoiceId)
        setInvoice(data)
      } catch (err) {
        console.error('Failed to load invoice:', err)
        setError('Invoice not found or failed to load')
      } finally {
        setIsLoading(false)
      }
    }
    loadInvoice()
  }, [invoiceId])

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toUpperCase()
    switch (normalizedStatus) {
      case 'PAID':
        return <CheckCircle size={20} style={{ color: colors.adminSuccess }} />
      case 'PENDING':
        return <Clock size={20} style={{ color: colors.adminWarning }} />
      case 'OVERDUE':
        return <XCircle size={20} style={{ color: colors.adminError }} />
      case 'CANCELLED':
        return <AlertCircle size={20} style={{ color: colors.textSecondary }} />
      default:
        return <AlertCircle size={20} style={{ color: colors.textSecondary }} />
    }
  }

  const handleEdit = () => {
    router.push(`/admin/quick-management/invoices/${invoiceId}/edit`)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        setIsDeleting(true)
        await deleteInvoice(invoiceId)
        router.push('/admin/quick-management?tab=invoices')
      } catch (err) {
        console.error('Failed to delete invoice:', err)
        alert('Failed to delete invoice. Please try again.')
        setIsDeleting(false)
      }
    }
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('PDF download functionality to be implemented')
  }

  const handleSendEmail = () => {
    // TODO: Implement email sending
    alert('Email sending functionality to be implemented')
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: colors.textSecondary }}>Loading invoice...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={48} style={{ color: colors.adminError }} />
        <p style={{ color: colors.textSecondary }}>{error || 'Invoice not found'}</p>
        <button
          onClick={() => router.push('/admin/quick-management?tab=invoices')}
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          Back to Invoices
        </button>
      </div>
    )
  }

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
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
                Invoice {invoice.id}
              </h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(invoice.status)}
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      invoice.status === 'PAID'
                        ? `${colors.adminSuccess}20`
                        : invoice.status === 'PENDING'
                        ? `${colors.adminWarning}20`
                        : `${colors.adminError}20`,
                    color:
                      invoice.status === 'PAID'
                        ? colors.adminSuccess
                        : invoice.status === 'PENDING'
                        ? colors.adminWarning
                        : colors.adminError,
                  }}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderMedium, color: colors.textPrimary }}
              title="Print"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderMedium, color: colors.textPrimary }}
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminAccent }}
            >
              <Send size={18} />
              Send Email
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              <Edit size={18} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-red-50 transition-colors"
              style={{ borderColor: colors.adminError, color: colors.adminError, opacity: isDeleting ? 0.6 : 1 }}
            >
              <Trash2 size={18} />
              {isDeleting && 'Deleting...'}
            </button>
          </div>
        </div>

        {/* Invoice Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Client Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <DashboardCard title="Client Information">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <User size={20} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Client Name
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {invoice.client_name || invoice.client || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <FileText size={20} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Client ID
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {invoice.client || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Invoice Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <DashboardCard title="Important Dates">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                    <Calendar size={20} style={{ color: colors.adminSuccess }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Invoice Date
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {formatDate(invoice.created_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}20` }}>
                    <Calendar size={20} style={{ color: colors.adminWarning }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Due Date
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {formatDate(invoice.due_date)}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Amount Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <DashboardCard title="Amount Summary">
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between pt-3"
                >
                  <span className="font-bold" style={{ color: colors.textPrimary }}>
                    Total Amount
                  </span>
                  <span className="font-bold text-xl" style={{ color: colors.adminPrimary }}>
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </div>

        {/* Line Items - Only show if available */}
        {invoice.items && invoice.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            <DashboardCard title="Line Items" subtitle={`${invoice.items.length} items`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                        Description
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item: any, index: number) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
                        className="border-b"
                        style={{ borderColor: colors.borderLight }}
                      >
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          {item.description || item.name || 'Item'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold" style={{ color: colors.textPrimary }}>
                          {formatCurrency(item.amount || 0)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          </motion.div>
        )}

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <DashboardCard title="Invoice Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Invoice ID
                </p>
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {invoice.id}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Created Date
                </p>
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {formatDate(invoice.created_date)}
                </p>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
  )
}

