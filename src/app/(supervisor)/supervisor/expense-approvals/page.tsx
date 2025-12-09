'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, BarChart2, PieChart, Calendar, Filter, Download } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchCombinedExpenses, fetchExpenseStatistics, ExpenseStatistics } from '@/lib/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'

import { useRouter } from 'next/navigation'

export default function ExpenseApprovalsPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<any[]>([])
  const [stats, setStats] = useState<ExpenseStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [expensesData, statsData] = await Promise.all([
          fetchCombinedExpenses(),
          fetchExpenseStatistics()
        ])
        setExpenses(expensesData)
        setStats(statsData)
      } catch (error) {
        console.error('Error loading expense data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const COLORS = [colors.supervisorPrimary, colors.supervisorAccent, '#FFBB28', '#FF8042', '#0088FE']

  if (loading) return <div className="p-8 text-center">Loading expenses...</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Expense Approvals
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Overview of company expenses and approvals
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/supervisor/expense-approvals/add"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ backgroundColor: colors.supervisorPrimary }}
          >
            <DollarSign size={18} />
            Add Expense
          </a>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">KSh {stats?.total_amount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Calendar size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">This Month</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">KSh {stats?.monthly_amount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Filter size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.status_breakdown.find(s => s.status === 'pending')?.count || 0}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <DashboardCard title="Expense Trends" subtitle="Monthly expense overview">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.expense_trend || []}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.supervisorPrimary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={colors.supervisorPrimary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.supervisorPrimary}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Category Breakdown" subtitle="Expenses by category">
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats?.category_breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="total_amount"
                  nameKey="category__name"
                >
                  {stats?.category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* All Expenses Table */}
      <DashboardCard title="All Expenses" subtitle="Detailed list of all expenses">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Item / Description</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Category</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Type</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (['Internal', 'External'].includes(expense.type)) {
                      router.push(`/supervisor/expense-approvals/${expense.id}`)
                    }
                  }}
                >
                  <td className="py-3 text-sm text-gray-900">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-sm text-gray-900 font-medium">
                    {expense.item_name || expense.notes || `For Vehicle ${expense.vehicle_registration}`}
                    {expense.vehicle_registration && <span className="text-xs text-gray-500 block">{expense.vehicle_registration}</span>}
                  </td>
                  <td className="py-3 text-sm">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500 capitalize">{expense.type?.replace('_', ' ')}</td>
                  <td className="py-3 text-sm font-semibold text-gray-900">
                    KSh {expense.total_amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                      expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {expense.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </motion.div>
  )
}