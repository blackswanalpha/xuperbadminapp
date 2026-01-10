'use client'

import { useState, useEffect } from 'react'
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
import {
  fetchPayments,
  fetchAllExpenses,
  fetchFinancialAnalysis,
  fetchRecentActivities,
  fetchUnifiedIncome,
  fetchAllExpensesPaginated,
  Payment,
  Expense,
  FinancialAnalysis,
  RecentActivitiesResponse,
  Activity,
  UnifiedIncomeRecord,
  UnifiedIncomeResponse,
  PaginatedExpensesResponse,
} from '@/lib/api'
import { Pagination } from '@/components/shared/pagination'

export default function QuickManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [income, setIncome] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [financialAnalysis, setFinancialAnalysis] = useState<FinancialAnalysis | null>(null)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Unified Income State
  const [unifiedIncome, setUnifiedIncome] = useState<UnifiedIncomeRecord[]>([])
  const [incomeTypeFilter, setIncomeTypeFilter] = useState<string>('')
  const [incomePage, setIncomePage] = useState(1)
  const [incomePageSize, setIncomePageSize] = useState(10)
  const [incomeCount, setIncomeCount] = useState(0)
  const [incomeTotalAmount, setIncomeTotalAmount] = useState(0)
  const [incomeTypeBreakdown, setIncomeTypeBreakdown] = useState<{[key: string]: {count: number; total_amount: number}}>({})
  const [isLoadingIncome, setIsLoadingIncome] = useState(false)

  // Expense Pagination State
  const [expensePage, setExpensePage] = useState(1)
  const [expensePageSize, setExpensePageSize] = useState(10)
  const [expenseCount, setExpenseCount] = useState(0)
  const [expenseTotalAmount, setExpenseTotalAmount] = useState(0)
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    type: 'income' | 'expense' | null
    id: string
    details: { label: string; value: string }[]
  }>({
    isOpen: false,
    type: null,
    id: '',
    details: [],
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Load unified income data
  const loadUnifiedIncome = async (page = 1, pageSize = 10, type = '', search = '') => {
    setIsLoadingIncome(true)
    try {
      const filters: { search?: string; type?: string } = {}
      if (search) filters.search = search
      if (type) filters.type = type

      const data = await fetchUnifiedIncome(filters, page, pageSize)
      setUnifiedIncome(data.results)
      setIncomeCount(data.count)
      setIncomeTotalAmount(data.total_amount)
      setIncomeTypeBreakdown(data.type_breakdown)
      setIncomePage(data.page)
    } catch (error) {
      console.error('Failed to load unified income:', error)
    } finally {
      setIsLoadingIncome(false)
    }
  }

  // Load paginated expenses
  const loadExpenses = async (page = 1, pageSize = 10, search = '') => {
    setIsLoadingExpenses(true)
    try {
      const filters: { search?: string } = {}
      if (search) filters.search = search

      const data = await fetchAllExpensesPaginated(filters, page, pageSize)
      setExpenses(data.results)
      setExpenseCount(data.count)
      setExpenseTotalAmount(data.total_amount)
      setExpensePage(data.page)
    } catch (error) {
      console.error('Failed to load expenses:', error)
    } finally {
      setIsLoadingExpenses(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [paymentsData, expensesData, analysisData, activitiesData, unifiedIncomeData] = await Promise.all([
          fetchPayments(),
          fetchAllExpensesPaginated({}, 1, expensePageSize),
          fetchFinancialAnalysis(),
          fetchRecentActivities(),
          fetchUnifiedIncome({}, 1, incomePageSize)
        ])
        setIncome(paymentsData.payments || [])
        setExpenses(expensesData.results || [])
        setExpenseCount(expensesData.count)
        setExpenseTotalAmount(expensesData.total_amount)
        setFinancialAnalysis(analysisData)
        setRecentActivities(activitiesData.activities || [])

        // Set unified income data
        setUnifiedIncome(unifiedIncomeData.results)
        setIncomeCount(unifiedIncomeData.count)
        setIncomeTotalAmount(unifiedIncomeData.total_amount)
        setIncomeTypeBreakdown(unifiedIncomeData.type_breakdown)
      } catch (error) {
        console.error('Failed to load quick management data', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate stats with safety checks
  const incomeList = Array.isArray(income) ? income : []
  const expensesList = Array.isArray(expenses) ? expenses : []

  const totalIncome = incomeList.length
  const totalExpensesAmount = financialAnalysis?.total_expenses || expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const totalRevenue = financialAnalysis?.total_revenue || incomeList.reduce((sum, payment) => sum + (typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0), 0)
  const netRevenue = financialAnalysis?.net_profit || (totalRevenue - totalExpensesAmount)
  const successfulPayments = incomeList.filter((payment) => payment.status === 'SUCCESS').length
  const pendingExpenses = expensesList.filter((exp) => exp.status.toLowerCase() === 'pending').length
  const pendingPayments = incomeList.filter((payment) => payment.status === 'PENDING').length
  const pendingItems = pendingPayments + pendingExpenses

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'income', label: 'Income', icon: <DollarSign size={18} /> },
    { id: 'expenses', label: 'Expenses', icon: <Wrench size={18} /> },
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={18} /> },
  ]

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`

  const handleDeleteIncome = (id: string) => {
    const payment = incomeList.find((p) => p.id.toString() === id)
    if (!payment) return

    const clientName = typeof payment.client === 'object'
      ? `${payment.client.first_name || ''} ${payment.client.last_name || ''}`.trim() || payment.client.email
      : payment.client_name || 'Client'

    setDeleteModal({
      isOpen: true,
      type: 'income',
      id,
      details: [
        { label: 'Payment ID', value: payment.id.toString() },
        { label: 'Client', value: clientName },
        { label: 'Amount', value: formatCurrency(typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0) },
        { label: 'Date', value: payment.created_at },
      ],
    })
  }

  const handleDeleteExpense = (id: string) => {
    const expense = expensesList.find((exp) => exp.id === id)
    if (!expense) return

    setDeleteModal({
      isOpen: true,
      type: 'expense',
      id,
      details: [
        { label: 'Expense ID', value: expense.id },
        { label: 'Category', value: expense.category },
        { label: 'Description', value: expense.description || 'N/A' },
        { label: 'Amount', value: formatCurrency(expense.amount) },
        { label: 'Date', value: expense.date },
      ],
    })
  }

  const confirmDelete = async () => {
    setIsDeleting(true)

    try {
      if (deleteModal.type === 'income') {
        // TODO: Implement payment delete API when available
        alert('Payment deletion not yet implemented')
        setIsDeleting(false)
        return
      } else if (deleteModal.type === 'expense') {
        // TODO: Implement expense delete API when available
        alert('Expense deletion not yet implemented')
        setIsDeleting(false)
        return
      }

      setDeleteModal({ isOpen: false, type: null, id: '', details: [] })
    } catch (error) {
      console.error('Failed to delete:', error)
      alert(`Failed to delete ${deleteModal.type}. Please try again.`)
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, type: null, id: '', details: [] })
    }
  }

  const renderDashboardTab = () => {
    // Calculate income breakdown from unified income data
    const contractPaymentsTotal = incomeTypeBreakdown.contract_payment?.total_amount || 0
    const contractDepositsTotal = incomeTypeBreakdown.contract_deposit?.total_amount || 0
    const jobCardPaymentsTotal = incomeTypeBreakdown.job_card_payment?.total_amount || 0

    const dashboardStats = [
      {
        title: 'Total Income',
        value: formatCurrency(incomeTotalAmount || totalRevenue),
        icon: DollarSign,
        trend: { value: `${incomeCount || totalIncome} records`, isPositive: true },
        color: colors.adminPrimary,
      },
      {
        title: 'Total Expenses',
        value: formatCurrency(expenseTotalAmount || totalExpensesAmount),
        icon: Wrench,
        trend: { value: `${expenseCount || expensesList.length} items`, isPositive: false },
        color: colors.adminError,
      },
      {
        title: 'Net Revenue',
        value: formatCurrency((incomeTotalAmount || totalRevenue) - (expenseTotalAmount || totalExpensesAmount)),
        icon: TrendingUp,
        trend: { value: ((incomeTotalAmount || totalRevenue) - (expenseTotalAmount || totalExpensesAmount)) > 0 ? 'Profit' : 'Loss', isPositive: ((incomeTotalAmount || totalRevenue) - (expenseTotalAmount || totalExpensesAmount)) > 0 },
        color: colors.adminSuccess,
      },
      {
        title: 'Pending Items',
        value: pendingItems.toString(),
        icon: Clock,
        trend: { value: `${pendingPayments} payments, ${pendingExpenses} expenses`, isPositive: pendingItems === 0 },
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

        {/* Income Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <DashboardCard title="Income Breakdown" subtitle="Revenue by source type">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contract Payments */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}10` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Contract Payments</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.adminSuccess}20`, color: colors.adminSuccess }}>
                    {incomeTypeBreakdown.contract_payment?.count || 0} records
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>
                  {formatCurrency(contractPaymentsTotal)}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${incomeTotalAmount > 0 ? (contractPaymentsTotal / incomeTotalAmount) * 100 : 0}%`,
                      backgroundColor: colors.adminSuccess
                    }}
                  />
                </div>
              </div>

              {/* Contract Deposits */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminWarning}10` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Contract Deposits</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.adminWarning}20`, color: colors.adminWarning }}>
                    {incomeTypeBreakdown.contract_deposit?.count || 0} records
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.adminWarning }}>
                  {formatCurrency(contractDepositsTotal)}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${incomeTotalAmount > 0 ? (contractDepositsTotal / incomeTotalAmount) * 100 : 0}%`,
                      backgroundColor: colors.adminWarning
                    }}
                  />
                </div>
              </div>

              {/* Job Card Payments */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Job Card Payments</span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.adminAccent}20`, color: colors.adminAccent }}>
                    {incomeTypeBreakdown.job_card_payment?.count || 0} records
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.adminAccent }}>
                  {formatCurrency(jobCardPaymentsTotal)}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${incomeTotalAmount > 0 ? (jobCardPaymentsTotal / incomeTotalAmount) * 100 : 0}%`,
                      backgroundColor: colors.adminAccent
                    }}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>
        </motion.div>

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
                  onClick={() => router.push('/admin/contracts')}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all"
                  style={{ borderColor: colors.adminPrimary, color: colors.adminPrimary }}
                >
                  <Plus size={20} />
                  <span className="font-medium">Record New Payment</span>
                </button>
                <button
                  onClick={() => router.push('/admin/quick-management/expenses/create')}
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
                {recentActivities.slice(0, 5).map((activity, index) => (
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
                          activity.type === 'payment' || activity.type === 'invoice_paid'
                            ? colors.adminSuccess
                            : activity.type === 'task'
                              ? colors.adminWarning
                              : colors.adminError,
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: colors.textPrimary }}>
                        {activity.title}
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
    const totalSuccessfulPayments = incomeList.filter((payment) => payment.status === 'SUCCESS').length
    const totalApprovedExpenses = expensesList.filter((exp) => exp.status.toLowerCase() === 'approved').length
    const avgPaymentValue = totalIncome > 0 ? (totalRevenue / totalIncome) : 0
    const profitMargin = totalRevenue > 0 ? ((netRevenue / totalRevenue) * 100).toFixed(1) : '0.0'

    const expensesByCategory = financialAnalysis?.expense_breakdown.reduce((acc, item) => {
      acc[item.category] = item.amount
      return acc
    }, {} as Record<string, number>) || expensesList.reduce((acc, exp) => {
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
              title="Avg Payment Value"
              value={formatCurrency(avgPaymentValue)}
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
              title="Successful Payments"
              value={totalSuccessfulPayments.toString()}
              icon={DollarSign}
              trend={{ value: `${totalSuccessfulPayments}/${totalIncome}`, isPositive: true }}
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
              trend={{ value: `${totalApprovedExpenses}/${expenses.length}`, isPositive: true }}
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
                      {formatCurrency(totalExpensesAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${(totalExpensesAmount / totalRevenue) * 100}%`,
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
                  const percentage = ((amount / totalExpensesAmount) * 100).toFixed(1)
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
    return (
      <TabPanel>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <DashboardCard
            title="All Expenses"
            subtitle={`${expenseCount} expenses found | Total: ${formatCurrency(expenseTotalAmount)}`}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setExpensePage(1)
                        loadExpenses(1, expensePageSize, searchQuery)
                      }
                    }}
                    className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <button
                  onClick={() => {
                    setExpensePage(1)
                    loadExpenses(1, expensePageSize, searchQuery)
                  }}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                  style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
                >
                  Search
                </button>
                <button
                  onClick={() => router.push('/admin/quick-management/expenses/create')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.adminSuccess }}
                >
                  <Plus size={18} />
                  Create Expense
                </button>
              </div>
            }
          >
            {isLoadingExpenses ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.adminPrimary }} />
              </div>
            ) : (
              <>
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
                      {expensesList.map((expense, index) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.02, duration: 0.3 }}
                          className="border-b hover:bg-gray-50 transition-colors"
                          style={{ borderColor: colors.borderLight }}
                        >
                          <td className="py-3 px-4 font-medium text-sm" style={{ color: colors.textPrimary }}>
                            {expense.id.substring(0, 8)}...
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
                            {expense.description || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  expense.status.toLowerCase() === 'approved'
                                    ? `${colors.adminSuccess}20`
                                    : expense.status.toLowerCase() === 'pending'
                                      ? `${colors.adminWarning}20`
                                      : `${colors.adminError}20`,
                                color:
                                  expense.status.toLowerCase() === 'approved'
                                    ? colors.adminSuccess
                                    : expense.status.toLowerCase() === 'pending'
                                      ? colors.adminWarning
                                      : colors.adminError,
                              }}
                            >
                              {expense.status}
                            </span>
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/admin/quick-management/expenses/${expense.id}`)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="View"
                              >
                                <Eye size={16} style={{ color: colors.textSecondary }} />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/quick-management/expenses/${expense.id}/edit`)}
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

                {/* Pagination */}
                <Pagination
                  currentPage={expensePage}
                  totalCount={expenseCount}
                  pageSize={expensePageSize}
                  onPageChange={(page) => {
                    setExpensePage(page)
                    loadExpenses(page, expensePageSize, searchQuery)
                  }}
                  onPageSizeChange={(size) => {
                    setExpensePageSize(size)
                    setExpensePage(1)
                    loadExpenses(1, size, searchQuery)
                  }}
                />
              </>
            )}
          </DashboardCard>
        </motion.div>
      </TabPanel>
    )
  }

  const renderIncomeTab = () => {
    const getIncomeTypeBadge = (type: string) => {
      switch (type) {
        case 'contract_payment':
          return { label: 'Payment', color: colors.adminSuccess }
        case 'contract_deposit':
          return { label: 'Deposit', color: colors.adminWarning }
        case 'job_card_payment':
          return { label: 'Job Card', color: colors.adminAccent }
        default:
          return { label: type, color: colors.adminPrimary }
      }
    }

    const getStatusColor = (status: string) => {
      const s = status.toUpperCase()
      if (s === 'SUCCESS' || s === 'ACTIVE' || s === 'COMPLETED') return colors.adminSuccess
      if (s === 'PENDING') return colors.adminWarning
      return colors.adminError
    }

    return (
      <TabPanel>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Income Type Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: !incomeTypeFilter ? colors.adminPrimary : colors.borderLight,
                backgroundColor: !incomeTypeFilter ? `${colors.adminPrimary}10` : 'white'
              }}
              onClick={() => {
                setIncomeTypeFilter('')
                setIncomePage(1)
                loadUnifiedIncome(1, incomePageSize, '', searchQuery)
              }}
            >
              <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>All Income</div>
              <div className="text-xl font-bold" style={{ color: colors.adminPrimary }}>{formatCurrency(incomeTotalAmount)}</div>
              <div className="text-xs" style={{ color: colors.textTertiary }}>{incomeCount} records</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: incomeTypeFilter === 'contract_payment' ? colors.adminSuccess : colors.borderLight,
                backgroundColor: incomeTypeFilter === 'contract_payment' ? `${colors.adminSuccess}10` : 'white'
              }}
              onClick={() => {
                setIncomeTypeFilter('contract_payment')
                setIncomePage(1)
                loadUnifiedIncome(1, incomePageSize, 'contract_payment', searchQuery)
              }}
            >
              <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>Contract Payments</div>
              <div className="text-xl font-bold" style={{ color: colors.adminSuccess }}>
                {formatCurrency(incomeTypeBreakdown.contract_payment?.total_amount || 0)}
              </div>
              <div className="text-xs" style={{ color: colors.textTertiary }}>
                {incomeTypeBreakdown.contract_payment?.count || 0} records
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: incomeTypeFilter === 'contract_deposit' ? colors.adminWarning : colors.borderLight,
                backgroundColor: incomeTypeFilter === 'contract_deposit' ? `${colors.adminWarning}10` : 'white'
              }}
              onClick={() => {
                setIncomeTypeFilter('contract_deposit')
                setIncomePage(1)
                loadUnifiedIncome(1, incomePageSize, 'contract_deposit', searchQuery)
              }}
            >
              <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>Contract Deposits</div>
              <div className="text-xl font-bold" style={{ color: colors.adminWarning }}>
                {formatCurrency(incomeTypeBreakdown.contract_deposit?.total_amount || 0)}
              </div>
              <div className="text-xs" style={{ color: colors.textTertiary }}>
                {incomeTypeBreakdown.contract_deposit?.count || 0} records
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md"
              style={{
                borderColor: incomeTypeFilter === 'job_card_payment' ? colors.adminAccent : colors.borderLight,
                backgroundColor: incomeTypeFilter === 'job_card_payment' ? `${colors.adminAccent}10` : 'white'
              }}
              onClick={() => {
                setIncomeTypeFilter('job_card_payment')
                setIncomePage(1)
                loadUnifiedIncome(1, incomePageSize, 'job_card_payment', searchQuery)
              }}
            >
              <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>Job Card Payments</div>
              <div className="text-xl font-bold" style={{ color: colors.adminAccent }}>
                {formatCurrency(incomeTypeBreakdown.job_card_payment?.total_amount || 0)}
              </div>
              <div className="text-xs" style={{ color: colors.textTertiary }}>
                {incomeTypeBreakdown.job_card_payment?.count || 0} records
              </div>
            </motion.div>
          </div>

          <DashboardCard
            title="Income Records"
            subtitle={`${incomeCount} records found | Total: ${formatCurrency(incomeTotalAmount)}`}
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
                    placeholder="Search income..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIncomePage(1)
                        loadUnifiedIncome(1, incomePageSize, incomeTypeFilter, searchQuery)
                      }
                    }}
                    className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <button
                  onClick={() => {
                    setIncomePage(1)
                    loadUnifiedIncome(1, incomePageSize, incomeTypeFilter, searchQuery)
                  }}
                  className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
                  style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
                >
                  Search
                </button>
              </div>
            }
          >
            {isLoadingIncome ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.adminPrimary }} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Reference
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Method
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
                      {unifiedIncome.map((record, index) => {
                        const typeBadge = getIncomeTypeBadge(record.type)
                        return (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.02, duration: 0.3 }}
                            className="border-b hover:bg-gray-50 transition-colors"
                            style={{ borderColor: colors.borderLight }}
                          >
                            <td className="py-3 px-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${typeBadge.color}20`,
                                  color: typeBadge.color,
                                }}
                              >
                                {typeBadge.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                              {record.source_reference}
                            </td>
                            <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                              {record.client_name || '-'}
                            </td>
                            <td className="py-3 px-4 font-semibold" style={{ color: colors.adminSuccess }}>
                              {formatCurrency(record.amount)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${colors.adminPrimary}20`,
                                  color: colors.adminPrimary,
                                }}
                              >
                                {record.method || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${getStatusColor(record.status)}20`,
                                  color: getStatusColor(record.status),
                                }}
                              >
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                              {record.date ? new Date(record.date).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {record.type === 'contract_payment' && (
                                  <button
                                    onClick={() => router.push(`/admin/quick-management/income/${record.source_id}`)}
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="View Payment Details"
                                  >
                                    <Eye size={16} style={{ color: colors.textSecondary }} />
                                  </button>
                                )}
                                {record.type === 'contract_deposit' && (
                                  <button
                                    onClick={() => router.push(`/admin/contracts/${record.source_id}`)}
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="View Contract"
                                  >
                                    <FileText size={16} style={{ color: colors.textSecondary }} />
                                  </button>
                                )}
                                {record.type === 'job_card_payment' && (
                                  <button
                                    onClick={() => router.push(`/admin/garage-management/job-card/${record.source_id}`)}
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="View Job Card"
                                  >
                                    <Wrench size={16} style={{ color: colors.textSecondary }} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={incomePage}
                  totalCount={incomeCount}
                  pageSize={incomePageSize}
                  onPageChange={(page) => {
                    setIncomePage(page)
                    loadUnifiedIncome(page, incomePageSize, incomeTypeFilter, searchQuery)
                  }}
                  onPageSizeChange={(size) => {
                    setIncomePageSize(size)
                    setIncomePage(1)
                    loadUnifiedIncome(1, size, incomeTypeFilter, searchQuery)
                  }}
                />
              </>
            )}
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
            Manage income, expenses, and financial records
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'income' && renderIncomeTab()}
        {activeTab === 'expenses' && renderExpensesTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={`Delete ${deleteModal.type === 'income' ? 'Payment' : 'Expense'}`}
        message={`Are you sure you want to delete this ${deleteModal.type === 'income' ? 'payment' : 'expense'}? This action cannot be undone.`}
        itemDetails={deleteModal.details}
        isDeleting={isDeleting}
      />
    </>
  )
}

