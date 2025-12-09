'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingDown, Wrench, Car, Download, ArrowLeft, AlertCircle, PieChart } from 'lucide-react'
import Link from 'next/link'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function ExpenseBreakdownPage() {
  const stats = [
    {
      title: 'Total Expenses',
      value: 'KSh 125K',
      icon: DollarSign,
      trend: { value: '+8.2%', isPositive: false },
      color: colors.adminError,
    },
    {
      title: 'Monthly Average',
      value: 'KSh 20.8K',
      icon: TrendingDown,
      trend: { value: '+12%', isPositive: false },
      color: colors.adminWarning,
    },
    {
      title: 'Maintenance Costs',
      value: 'KSh 45K',
      icon: Wrench,
      trend: { value: '+15%', isPositive: false },
      color: colors.adminAccent,
    },
    {
      title: 'Fuel Expenses',
      value: 'KSh 38K',
      icon: Car,
      trend: { value: '+3.1%', isPositive: false },
      color: colors.adminPrimary,
    },
  ]

  // Expense categories with detailed breakdown
  const expenseCategories = [
    {
      category: 'Maintenance',
      amount: 45000,
      percentage: 36,
      color: colors.adminError,
      items: [
        { name: 'Routine Service', amount: 18000 },
        { name: 'Engine Repairs', amount: 15000 },
        { name: 'Tire Replacement', amount: 12000 },
      ]
    },
    {
      category: 'Fuel',
      amount: 38000,
      percentage: 30.4,
      color: colors.adminWarning,
      items: [
        { name: 'Gasoline', amount: 25000 },
        { name: 'Diesel', amount: 13000 },
      ]
    },
    {
      category: 'Insurance',
      amount: 22000,
      percentage: 17.6,
      color: colors.adminPrimary,
      items: [
        { name: 'Vehicle Insurance', amount: 15000 },
        { name: 'Comprehensive Coverage', amount: 7000 },
      ]
    },
    {
      category: 'Registration & Licenses',
      amount: 12000,
      percentage: 9.6,
      color: colors.adminAccent,
      items: [
        { name: 'Vehicle Registration', amount: 8000 },
        { name: 'Driver Licenses', amount: 4000 },
      ]
    },
    {
      category: 'Other',
      amount: 8000,
      percentage: 6.4,
      color: colors.adminSuccess,
      items: [
        { name: 'Parking Fees', amount: 5000 },
        { name: 'Miscellaneous', amount: 3000 },
      ]
    },
  ]

  // Monthly expense trend
  const monthlyExpenses = [
    { month: 'Jan', amount: 18000 },
    { month: 'Feb', amount: 22000 },
    { month: 'Mar', amount: 19000 },
    { month: 'Apr', amount: 25000 },
    { month: 'May', amount: 21000 },
    { month: 'Jun', amount: 20000 },
  ]

  // Top expense vehicles
  const topExpenseVehicles = [
    { vehicle: 'Toyota Corolla - KAA 123A', amount: 15000, category: 'Maintenance' },
    { vehicle: 'Honda Civic - KBB 456B', amount: 12000, category: 'Fuel' },
    { vehicle: 'Nissan Altima - KCC 789C', amount: 18000, category: 'Maintenance' },
    { vehicle: 'Mazda CX-5 - KDD 012D', amount: 8000, category: 'Insurance' },
  ]

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderLight }}
            >
              <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Expense Breakdown Report
              </h1>
              <p style={{ color: colors.textSecondary }}>
                Comprehensive analysis of fleet expenses and cost optimization opportunities
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Download size={20} />
            Export Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Expense Breakdown Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <DashboardCard title="Expense Categories" subtitle="Breakdown by category type">
              <div className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium" style={{ color: colors.textPrimary }}>
                          {category.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>
                          KSh {(category.amount / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs" style={{ color: colors.textTertiary }}>
                          {category.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </DashboardCard>
          </motion.div>

          {/* Top Expense Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <DashboardCard title="Top Expense Vehicles" subtitle="Vehicles with highest costs">
              <div className="space-y-4">
                {topExpenseVehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.vehicle}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: `${colors.borderLight}40` }}
                  >
                    <div>
                      <div className="font-medium mb-1" style={{ color: colors.textPrimary }}>
                        {vehicle.vehicle}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        Primary: {vehicle.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold" style={{ color: colors.adminError }}>
                        KSh {(vehicle.amount / 1000).toFixed(0)}K
                      </div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: colors.textTertiary }}>
                        <AlertCircle size={12} />
                        High cost
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </DashboardCard>
          </motion.div>
        </div>

        {/* Detailed Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <DashboardCard title="Detailed Category Breakdown" subtitle="Complete expense itemization">
            <div className="space-y-6">
              {expenseCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + categoryIndex * 0.1, duration: 0.5 }}
                  className="border rounded-lg p-4"
                  style={{ borderColor: colors.borderLight }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                        {category.category}
                      </h3>
                    </div>
                    <div className="text-xl font-bold" style={{ color: category.color }}>
                      KSh {(category.amount / 1000).toFixed(0)}K
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between py-2 px-3 rounded"
                        style={{ backgroundColor: `${category.color}10` }}
                      >
                        <span style={{ color: colors.textPrimary }}>{item.name}</span>
                        <span className="font-medium" style={{ color: colors.textPrimary }}>
                          KSh {(item.amount / 1000).toFixed(0)}K
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    
  )
}