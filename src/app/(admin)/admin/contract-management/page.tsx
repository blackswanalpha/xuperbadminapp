'use client'

import { motion } from 'framer-motion'
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Search, Filter } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

export default function ContractManagementPage() {
  const stats = [
    {
      title: 'Total Contracts',
      value: '89',
      icon: FileText,
      trend: { value: '+7', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active',
      value: '56',
      icon: CheckCircle,
      trend: { value: '+5', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Pending',
      value: '18',
      icon: Clock,
      trend: { value: '+2', isPositive: false },
      color: colors.adminWarning,
    },
    {
      title: 'Expiring Soon',
      value: '15',
      icon: AlertCircle,
      trend: { value: '+3', isPositive: false },
      color: colors.adminError,
    },
  ]

  const contracts = [
    {
      id: 'CNT-001',
      client: 'John Doe',
      vehicle: 'Toyota Corolla (KAA 123A)',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'Active',
      value: 'KSh 450,000',
    },
    {
      id: 'CNT-002',
      client: 'Jane Smith',
      vehicle: 'Honda Civic (KBB 456B)',
      startDate: '2024-01-15',
      endDate: '2024-07-15',
      status: 'Active',
      value: 'KSh 325,000',
    },
    {
      id: 'CNT-003',
      client: 'Bob Johnson',
      vehicle: 'Nissan Altima (KCC 789C)',
      startDate: '2024-02-01',
      endDate: '2024-08-01',
      status: 'Pending',
      value: 'KSh 580,000',
    },
    {
      id: 'CNT-004',
      client: 'Alice Brown',
      vehicle: 'Mazda CX-5 (KDD 012D)',
      startDate: '2023-06-01',
      endDate: '2024-02-01',
      status: 'Expiring',
      value: 'KSh 412,000',
    },
  ]

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Contract Management
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Manage rental contracts and agreements
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Plus size={20} />
            Create Contract
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

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <DashboardCard
            title="All Contracts"
            subtitle="Manage rental agreements and contracts"
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
                    placeholder="Search contracts..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <button
                  className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.borderLight }}
                >
                  <Filter size={18} style={{ color: colors.textSecondary }} />
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Contract ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Vehicle
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Period
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Value
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, index) => (
                    <motion.tr
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                        {contract.id}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                        {contract.client}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                        {contract.vehicle}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                        {contract.startDate} - {contract.endDate}
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                        {contract.value}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              contract.status === 'Active'
                                ? `${colors.adminSuccess}20`
                                : contract.status === 'Pending'
                                ? `${colors.adminWarning}20`
                                : `${colors.adminError}20`,
                            color:
                              contract.status === 'Active'
                                ? colors.adminSuccess
                                : contract.status === 'Pending'
                                ? colors.adminWarning
                                : colors.adminError,
                          }}
                        >
                          {contract.status}
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

