'use client'

import { motion } from 'framer-motion'
import { Car, TrendingUp, Clock, Target, Download, ArrowLeft, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function VehicleUtilizationAnalysisPage() {
  const stats = [
    {
      title: 'Fleet Utilization',
      value: '75%',
      icon: Car,
      trend: { value: '+5.2%', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active Vehicles',
      value: '18/24',
      icon: Activity,
      trend: { value: '+3', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Avg Usage Hours',
      value: '8.5h',
      icon: Clock,
      trend: { value: '+1.2h', isPositive: true },
      color: colors.adminAccent,
    },
    {
      title: 'Efficiency Score',
      value: '82%',
      icon: Target,
      trend: { value: '+7%', isPositive: true },
      color: colors.adminWarning,
    },
  ]

  // Vehicle utilization data
  const vehicleData = [
    {
      vehicle: 'Toyota Corolla',
      plate: 'KAA 123A',
      utilization: 85,
      hoursUsed: 170,
      totalHours: 200,
      status: 'Active',
      efficiency: 'High',
      contracts: 3,
    },
    {
      vehicle: 'Honda Civic',
      plate: 'KBB 456B',
      utilization: 78,
      hoursUsed: 156,
      totalHours: 200,
      status: 'Active',
      efficiency: 'Good',
      contracts: 2,
    },
    {
      vehicle: 'Nissan Altima',
      plate: 'KCC 789C',
      utilization: 45,
      hoursUsed: 90,
      totalHours: 200,
      status: 'Maintenance',
      efficiency: 'Low',
      contracts: 1,
    },
    {
      vehicle: 'Mazda CX-5',
      plate: 'KDD 012D',
      utilization: 92,
      hoursUsed: 184,
      totalHours: 200,
      status: 'Active',
      efficiency: 'High',
      contracts: 4,
    },
    {
      vehicle: 'BMW X3',
      plate: 'KEE 345E',
      utilization: 67,
      hoursUsed: 134,
      totalHours: 200,
      status: 'Available',
      efficiency: 'Medium',
      contracts: 2,
    },
    {
      vehicle: 'Audi A4',
      plate: 'KFF 678F',
      utilization: 88,
      hoursUsed: 176,
      totalHours: 200,
      status: 'Active',
      efficiency: 'High',
      contracts: 3,
    },
  ]

  // Weekly utilization trend
  const weeklyUtilization = [
    { week: 'Week 1', utilization: 72 },
    { week: 'Week 2', utilization: 68 },
    { week: 'Week 3', utilization: 75 },
    { week: 'Week 4', utilization: 79 },
  ]

  // Performance categories
  const performanceCategories = [
    { category: 'High Performance', count: 3, percentage: 50, color: colors.adminSuccess },
    { category: 'Good Performance', count: 2, percentage: 33.3, color: colors.adminPrimary },
    { category: 'Needs Improvement', count: 1, percentage: 16.7, color: colors.adminWarning },
  ]

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return colors.adminSuccess
    if (utilization >= 60) return colors.adminPrimary
    if (utilization >= 40) return colors.adminWarning
    return colors.adminError
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return colors.adminSuccess
      case 'Available': return colors.adminPrimary
      case 'Maintenance': return colors.adminWarning
      default: return colors.textSecondary
    }
  }

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
                Vehicle Utilization Analysis
              </h1>
              <p style={{ color: colors.textSecondary }}>
                Comprehensive analysis of fleet performance, usage patterns, and optimization opportunities
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

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <DashboardCard title="Performance Categories" subtitle="Fleet performance distribution">
              <div className="space-y-4">
                {performanceCategories.map((category, index) => (
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
                          {category.count} vehicles
                        </div>
                        <div className="text-xs" style={{ color: colors.textTertiary }}>
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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

          {/* Weekly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <DashboardCard title="Utilization Trend" subtitle="Weekly performance overview">
              <div className="space-y-4">
                {weeklyUtilization.map((week, index) => (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {week.week}
                    </span>
                    <div className="flex items-center gap-3 flex-1 mx-4">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${week.utilization}%` }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                          className="h-2 rounded-full"
                          style={{ backgroundColor: getUtilizationColor(week.utilization) }}
                        />
                      </div>
                      <span className="font-semibold min-w-[3rem] text-right" style={{ color: colors.textPrimary }}>
                        {week.utilization}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </DashboardCard>
          </motion.div>
        </div>

        {/* Detailed Vehicle Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <DashboardCard title="Detailed Vehicle Analysis" subtitle="Individual vehicle performance metrics">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Vehicle
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Plate Number
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Utilization
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Hours Used
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Contracts
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleData.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.plate}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        {vehicle.vehicle}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {vehicle.plate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${vehicle.utilization}%`,
                                backgroundColor: getUtilizationColor(vehicle.utilization),
                              }}
                            />
                          </div>
                          <span className="font-semibold min-w-[3rem]" style={{ color: colors.textPrimary }}>
                            {vehicle.utilization}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {vehicle.hoursUsed}/{vehicle.totalHours}h
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${colors.adminPrimary}20`,
                            color: colors.adminPrimary,
                          }}
                        >
                          {vehicle.contracts}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getStatusColor(vehicle.status)}20`,
                            color: getStatusColor(vehicle.status),
                          }}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            vehicle.efficiency === 'High'
                              ? 'bg-green-100 text-green-700'
                              : vehicle.efficiency === 'Good'
                              ? 'bg-blue-100 text-blue-700'
                              : vehicle.efficiency === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {vehicle.efficiency}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </motion.div>
      </motion.div>
    
  )
}