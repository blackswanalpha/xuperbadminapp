'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  CreditCard,
  Receipt,
  ExternalLink,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchPayment, Payment } from '@/lib/api'

export default function IncomeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params.id as string

  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPayment = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchPayment(paymentId)
        setPayment(data)
      } catch (err) {
        console.error('Failed to load payment:', err)
        setError('Payment not found or failed to load')
      } finally {
        setIsLoading(false)
      }
    }
    loadPayment()
  }, [paymentId])

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `KSh ${numAmount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle size={20} style={{ color: colors.adminSuccess }} />
      case 'PENDING':
        return <Clock size={20} style={{ color: colors.adminWarning }} />
      case 'FAILED':
        return <XCircle size={20} style={{ color: colors.adminError }} />
      default:
        return <AlertCircle size={20} style={{ color: colors.textSecondary }} />
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'MPESA':
        return 'M-Pesa'
      case 'CARD':
        return 'Card Payment'
      case 'BANK':
        return 'Bank Transfer'
      case 'CASH':
        return 'Cash'
      default:
        return method
    }
  }

  const getClientName = (payment: Payment) => {
    if (payment.client_name) return payment.client_name
    if (typeof payment.client === 'object' && payment.client) {
      const { first_name, last_name, email } = payment.client
      if (first_name || last_name) {
        return `${first_name || ''} ${last_name || ''}`.trim()
      }
      return email
    }
    return `Client #${payment.client}`
  }

  const handleViewContract = () => {
    if (payment?.contract) {
      router.push(`/admin/contracts/${payment.contract}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: colors.textSecondary }}>Loading payment details...</p>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle size={48} style={{ color: colors.adminError }} />
        <p style={{ color: colors.textSecondary }}>{error || 'Payment not found'}</p>
        <button
          onClick={() => router.push('/admin/quick-management?tab=income')}
          className="px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: colors.adminPrimary }}
        >
          Back to Income
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
              Payment #{payment.id}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusIcon(payment.status)}
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor:
                    payment.status === 'SUCCESS'
                      ? `${colors.adminSuccess}20`
                      : payment.status === 'PENDING'
                      ? `${colors.adminWarning}20`
                      : `${colors.adminError}20`,
                  color:
                    payment.status === 'SUCCESS'
                      ? colors.adminSuccess
                      : payment.status === 'PENDING'
                      ? colors.adminWarning
                      : colors.adminError,
                }}
              >
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {payment.contract && (
            <button
              onClick={handleViewContract}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              <ExternalLink size={18} />
              View Contract
            </button>
          )}
        </div>
      </div>

      {/* Payment Details Grid */}
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
                    {getClientName(payment)}
                  </p>
                </div>
              </div>
              {typeof payment.client === 'object' && payment.client?.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <FileText size={20} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Email
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {payment.client.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DashboardCard>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <DashboardCard title="Payment Details">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                  <CreditCard size={20} style={{ color: colors.adminSuccess }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Payment Method
                  </p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {getMethodLabel(payment.method)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}20` }}>
                  <Calendar size={20} style={{ color: colors.adminWarning }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Payment Date
                  </p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {formatDate(payment.created_at)}
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
          <DashboardCard title="Amount">
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-3">
                <span className="font-bold" style={{ color: colors.textPrimary }}>
                  Total Amount
                </span>
                <span className="font-bold text-xl" style={{ color: colors.adminSuccess }}>
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <DashboardCard title="Transaction Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                Payment ID
              </p>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                {payment.id}
              </p>
            </div>
            {payment.transaction_id && (
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Transaction ID
                </p>
                <p className="font-medium font-mono" style={{ color: colors.textPrimary }}>
                  {payment.transaction_id}
                </p>
              </div>
            )}
            {payment.contract && (
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Contract Number
                </p>
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {payment.contract_number || `#${payment.contract}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                Created At
              </p>
              <p className="font-medium" style={{ color: colors.textPrimary }}>
                {formatDate(payment.created_at)}
              </p>
            </div>
          </div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  )
}
