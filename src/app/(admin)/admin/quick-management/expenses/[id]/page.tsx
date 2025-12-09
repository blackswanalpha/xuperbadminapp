'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Calendar,
  Car,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Tag,
  DollarSign,
  Wrench,
  Image as ImageIcon,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { mockExpenses } from '@/data/quick-management-mock'
import type { Expense } from '@/types/quick-management'

export default function ExpenseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual API call
    const foundExpense = mockExpenses.find((exp) => exp.id === expenseId)
    if (foundExpense) {
      setExpense(foundExpense)
      setIsLoading(false)
    } else {
      setIsLoading(false)
      alert('Expense not found')
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }, [expenseId, router])

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
    switch (status) {
      case 'Approved':
        return <CheckCircle size={20} style={{ color: colors.adminSuccess }} />
      case 'Pending':
        return <Clock size={20} style={{ color: colors.adminWarning }} />
      case 'Rejected':
        return <XCircle size={20} style={{ color: colors.adminError }} />
      default:
        return <AlertCircle size={20} style={{ color: colors.textSecondary }} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Service':
        return colors.adminPrimary
      case 'Bodywork':
        return colors.adminWarning
      case 'Mechanical':
        return colors.adminAccent
      default:
        return colors.textSecondary
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Service':
        return <Wrench size={20} />
      case 'Bodywork':
        return <Car size={20} />
      case 'Mechanical':
        return <Wrench size={20} />
      default:
        return <Tag size={20} />
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/quick-management/expenses/${expenseId}/edit`)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      // TODO: Implement delete API call
      alert('Expense deleted successfully!')
      router.push('/dashboard/quick-management?tab=expenses')
    }
  }

  const handleDownloadReceipt = () => {
    if (expense?.receiptUrl) {
      // TODO: Implement receipt download
      alert('Receipt download functionality to be implemented')
    } else {
      alert('No receipt available for this expense')
    }
  }

  const handleApprove = () => {
    // TODO: Implement approval API call
    alert('Expense approval functionality to be implemented')
  }

  const handleReject = () => {
    // TODO: Implement rejection API call
    alert('Expense rejection functionality to be implemented')
  }

  if (isLoading) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <p style={{ color: colors.textSecondary }}>Loading expense...</p>
        </div>
      
    )
  }

  if (!expense) {
    return (
      
        <div className="flex items-center justify-center h-64">
          <p style={{ color: colors.textSecondary }}>Expense not found</p>
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
                Expense {expense.id}
              </h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(expense.status)}
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor:
                      expense.status === 'Approved'
                        ? `${colors.adminSuccess}20`
                        : expense.status === 'Pending'
                        ? `${colors.adminWarning}20`
                        : `${colors.adminError}20`,
                    color:
                      expense.status === 'Approved'
                        ? colors.adminSuccess
                        : expense.status === 'Pending'
                        ? colors.adminWarning
                        : colors.adminError,
                  }}
                >
                  {expense.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {expense.receiptUrl && (
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderMedium, color: colors.textPrimary }}
              >
                <Download size={18} />
                Receipt
              </button>
            )}
            {expense.status === 'Pending' && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.adminSuccess }}
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-red-50 transition-colors"
                  style={{ borderColor: colors.adminError, color: colors.adminError }}
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </>
            )}
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium hover:bg-red-50 transition-colors"
              style={{ borderColor: colors.adminError, color: colors.adminError }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Expense Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Category & Vehicle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <DashboardCard title="Category & Vehicle">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Category
                    </p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-1"
                      style={{
                        backgroundColor: `${getCategoryColor(expense.category)}20`,
                        color: getCategoryColor(expense.category),
                      }}
                    >
                      {expense.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}20` }}>
                    <Car size={20} style={{ color: colors.adminAccent }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Vehicle
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {expense.vehicleName}
                    </p>
                    <p className="text-sm" style={{ color: colors.textTertiary }}>
                      {expense.vehicleId}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Date & Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <DashboardCard title="Date & Amount">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                    <Calendar size={20} style={{ color: colors.adminSuccess }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Expense Date
                    </p>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <DollarSign size={20} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Amount
                    </p>
                    <p className="font-bold text-xl" style={{ color: colors.adminPrimary }}>
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Approval Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <DashboardCard title="Approval Information">
              {expense.approvedBy ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                      <User size={20} style={{ color: colors.adminSuccess }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Approved By
                      </p>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {expense.approvedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                      <Clock size={20} style={{ color: colors.adminSuccess }} />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Approved At
                      </p>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {expense.approvedAt ? new Date(expense.approvedAt).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle size={48} className="mx-auto mb-3" style={{ color: colors.textTertiary }} />
                  <p style={{ color: colors.textSecondary }}>
                    {expense.status === 'Pending' ? 'Awaiting approval' : 'Not approved'}
                  </p>
                </div>
              )}
            </DashboardCard>
          </motion.div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <DashboardCard title="Description">
            <p className="text-base leading-relaxed" style={{ color: colors.textPrimary }}>
              {expense.description}
            </p>
          </DashboardCard>
        </motion.div>

        {/* Receipt */}
        {expense.receiptUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-6"
          >
            <DashboardCard title="Receipt">
              <div className="flex items-center justify-between p-4 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}20` }}>
                    <ImageIcon size={24} style={{ color: colors.adminPrimary }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      Receipt Document
                    </p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {expense.receiptUrl}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.adminPrimary }}
                >
                  <Download size={18} />
                  Download
                </button>
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
          <DashboardCard title="Expense Metadata">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Created At
                </p>
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {new Date(expense.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                  Last Updated
                </p>
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {new Date(expense.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    
  )
}

