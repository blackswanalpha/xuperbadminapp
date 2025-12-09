'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Wrench,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal'
import { colors } from '@/lib/theme/colors'
import { mockInvoices, mockExpenses, mockActivityItems } from '@/data/quick-management-mock'
import type { Invoice, Expense } from '@/types/quick-management'

export default function QuickManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'invoice' | 'expense' | null
    id: string
    details: { label: string; value: string }[]
  }>({
    isOpen: false,
    type: null,
    id: '',
    details: [],
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Calculate stats from mock data
  const totalInvoices = mockInvoices.length
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalRevenue = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const netRevenue = totalRevenue - totalExpenses
  const pendingInvoices = mockInvoices.filter((inv) => inv.status === 'Pending').length
  const pendingExpenses = mockExpenses.filter((exp) => exp.status === 'Pending').length
  const pendingItems = pendingInvoices + pendingExpenses

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={18} /> },
    { id: 'expenses', label: 'Expenses', icon: <Wrench size={18} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={18} /> },
  ]

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`

  const handleDeleteInvoice = (id: string) => {
    const invoice = mockInvoices.find((inv) => inv.id === id)
    if (!invoice) return

    setDeleteModal({
      isOpen: true,
      type: 'invoice',
      id,
      details: [
        { label: 'Invoice ID', value: invoice.id },
        { label: 'Client', value: invoice.clientName },
        { label: 'Amount', value: formatCurrency(invoice.amount) },
        { label: 'Date', value: invoice.date },
      ],
    })
  }

  const handleDeleteExpense = (id: string) => {
    const expense = mockExpenses.find((exp) => exp.id === id)
    if (!expense) return

    setDeleteModal({
      isOpen: true,
      type: 'expense',
      id,
      details: [
        { label: 'Expense ID', value: expense.id },
        { label: 'Category', value: expense.category },
        { label: 'Description', value: expense.description },
        { label: 'Amount', value: formatCurrency(expense.amount) },
        { label: 'Date', value: expense.date },
      ],
    })
  }

  const confirmDelete = async () => {
    setIsDeleting(true)

    // TODO: Implement actual API call to delete invoice/expense
    setTimeout(() => {
      setIsDeleting(false)
      setDeleteModal({ isOpen: false, type: null, id: '', details: [] })

      // Show success notification
      alert(`${deleteModal.type === 'invoice' ? 'Invoice' : 'Expense'} deleted successfully!`)

      // In a real app, you would refetch the data here
      // For now, we're just closing the modal
    }, 1000)
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, type: null, id: '', details: [] })
    }
  }

  const renderDashboardTab = () => {
    const dashboardStats = [
      {
        title: 'Total Invoices',
        value: totalInvoices.toString(),
        icon: FileText,
        trend: { value: '+12', isPositive: true },
        color: colors.adminPrimary,
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(totalExpenses),
        icon: DollarSign,
        trend: { value: '+5', isPositive: false },
        color: colors.adminError,
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(netRevenue),
        icon: TrendingUp,
        trend: { value: '+18%', isPositive: true },
        color: colors.adminSuccess,
      },
      {
        title: 'Pending Items',
        value: pendingItems.toString(),
        icon: Clock,
        trend: { value: '-3', isPositive: true },
        color: colors.adminWarning,
      },
    ]

    return (
      <TabPanel>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <DashboardCard title="Quick Actions">
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard/quick-management/invoices/create')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ borderColor: colors.adminPrimary, color: colors.adminPrimary }}
                >
                  <Plus size={20} />
                  <span className="font-medium">Create New Invoice</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/quick-management/expenses/create')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ borderColor: colors.adminSuccess, color: colors.adminSuccess }}
                >
                  <Plus size={20} />
                  <span className="font-medium">Create New Expense</span>
                </button>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <DashboardCard title="Recent Activity" subtitle="Latest updates">
              <div className="space-y-3">
                {mockActivityItems.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          activity.status === 'Paid' || activity.status === 'Approved'
                            ? colors.adminSuccess
                            : activity.status === 'Pending'
                            ? colors.adminWarning
                            : colors.adminError,
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: colors.textPrimary }}>
                        {activity.action}
                      </p>
                      <p className="text-xs" style={{ color: colors.textTertiary }}>
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </DashboardCard>
          </motion.div>
        </div>
      </TabPanel>
    )
  }

  const renderAnalysisTab = () => {
    const totalPaidInvoices = mockInvoices.filter((inv) => inv.status === 'Paid').length
    const totalApprovedExpenses = mockExpenses.filter((exp) => exp.status === 'Approved').length
    const avgInvoiceValue = totalRevenue / totalInvoices
    const profitMargin = ((netRevenue / totalRevenue) * 100).toFixed(1)

    const expensesByCategory = mockExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>)

    return (
      <TabPanel>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <StatCard
              title="Profit Margin"
              value={`${profitMargin}%`}
              icon={TrendingUp}
              trend={{ value: '+2.5%', isPositive: true }}
              color={colors.adminSuccess}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <StatCard
              title="Avg Invoice Value"
              value={formatCurrency(avgInvoiceValue)}
              icon={DollarSign}
              trend={{ value: '+5%', isPositive: true }}
              color={colors.adminPrimary}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <StatCard
              title="Paid Invoices"
              value={totalPaidInvoices.toString()}
              icon={FileText}
              trend={{ value: `${totalPaidInvoices}/${totalInvoices}`, isPositive: true }}
              color={colors.adminAccent}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <StatCard
              title="Approved Expenses"
              value={totalApprovedExpenses.toString()}
              icon={Wrench}
              trend={{ value: `${totalApprovedExpenses}/${mockExpenses.length}`, isPositive: true }}
              color={colors.adminWarning}
            />
          </motion.div>
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue vs Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <DashboardCard title="Revenue vs Expenses" subtitle="Comparison overview">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: colors.textSecondary }}>Total Revenue</span>
                    <span className="font-semibold" style={{ color: colors.adminSuccess }}>
                      {formatCurrency(totalRevenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: '100%',
                        backgroundColor: colors.adminSuccess,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: colors.textSecondary }}>Total Expenses</span>
                    <span className="font-semibold" style={{ color: colors.adminError }}>
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${(totalExpenses / totalRevenue) * 100}%`,
                        backgroundColor: colors.adminError,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>
                      Net Revenue
                    </span>
                    <span className="font-bold text-lg" style={{ color: colors.adminPrimary }}>
                      {formatCurrency(netRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Expense Breakdown by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <DashboardCard title="Expense Breakdown" subtitle="By category">
              <div className="space-y-4">
                {Object.entries(expensesByCategory).map(([category, amount], index) => {
                  const percentage = ((amount / totalExpenses) * 100).toFixed(1)
                  const categoryColor =
                    category === 'Service'
                      ? colors.adminPrimary
                      : category === 'Bodywork'
                      ? colors.adminWarning
                      : colors.adminAccent

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: colors.textSecondary }}>{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm" style={{ color: colors.textTertiary }}>
                            {percentage}%
                          </span>
                          <span className="font-semibold" style={{ color: categoryColor }}>
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: categoryColor }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </DashboardCard>
          </motion.div>
        </div>

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <DashboardCard title="Monthly Trends" subtitle="Revenue and expenses over time">
            <div className="h-64 flex items-center justify-center" style={{ color: colors.textTertiary }}>
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-4" style={{ color: colors.textTertiary }} />
                <p>Chart Component (To be implemented)</p>
                <p className="text-sm mt-2">Integrate chart library like Recharts or Chart.js</p>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      </TabPanel>
    )
  }

  const renderExpensesTab = () => {
    const filteredExpenses = mockExpenses.filter(
      (expense) =>
        expense.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <TabPanel>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <DashboardCard
            title="All Expenses"
            subtitle={`${filteredExpenses.length} expenses found`}
            action={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textTertiary }}
                  />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <button
                  onClick={() => router.push('/dashboard/quick-management/expenses/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.adminSuccess }}
                >
                  <Plus size={18} />
                  Create Expense
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Expense ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Description
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        {expense.id}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              expense.category === 'Service'
                                ? `${colors.adminPrimary}20`
                                : expense.category === 'Bodywork'
                                ? `${colors.adminWarning}20`
                                : `${colors.adminAccent}20`,
                            color:
                              expense.category === 'Service'
                                ? colors.adminPrimary
                                : expense.category === 'Bodywork'
                                ? colors.adminWarning
                                : colors.adminAccent,
                          }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {expense.description}
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
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
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                        {expense.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/quick-management/expenses/${expense.id}`)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="View"
                          >
                            <Eye size={16} style={{ color: colors.textSecondary }} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/quick-management/expenses/${expense.id}/edit`)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} style={{ color: colors.adminPrimary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} style={{ color: colors.adminError }} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </motion.div>
      </TabPanel>
    )
  }

  const renderInvoicesTab = () => {
    const filteredInvoices = mockInvoices.filter(
      (invoice) =>
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <TabPanel>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <DashboardCard
            title="All Invoices"
            subtitle={`${filteredInvoices.length} invoices found`}
            action={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textTertiary }}
                  />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <button
                  onClick={() => router.push('/dashboard/quick-management/invoices/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.adminPrimary }}
                >
                  <Plus size={18} />
                  Create Invoice
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Invoice ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        {invoice.id}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {invoice.clientName}
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              invoice.status === 'Paid'
                                ? `${colors.adminSuccess}20`
                                : invoice.status === 'Pending'
                                ? `${colors.adminWarning}20`
                                : `${colors.adminError}20`,
                            color:
                              invoice.status === 'Paid'
                                ? colors.adminSuccess
                                : invoice.status === 'Pending'
                                ? colors.adminWarning
                                : colors.adminError,
                          }}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                        {invoice.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/quick-management/invoices/${invoice.id}`)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="View"
                          >
                            <Eye size={16} style={{ color: colors.textSecondary }} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/quick-management/invoices/${invoice.id}/edit`)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} style={{ color: colors.adminPrimary }} />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} style={{ color: colors.adminError }} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </motion.div>
      </TabPanel>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Quick Management
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Manage invoices, expenses, and financial records
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal.type === 'invoice' ? 'Invoice' : 'Expense'}`}
        message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
        itemDetails={deleteModal.details}
        isDeleting={isDeleting}
      />
    </>
  )
}

