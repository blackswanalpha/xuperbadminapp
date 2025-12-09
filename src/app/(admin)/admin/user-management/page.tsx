'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  Shield,
  UserCheck,
  Plus,
  Search,
  Filter,
  Award,
  TrendingUp,
  DollarSign,
  LayoutDashboard,
  Gift,
  BarChart3,
  PieChart,
  Calendar,
  Activity,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import { colors } from '@/lib/theme/colors'
import {
  mockUsers,
  mockClientUsers,
  mockLoyaltyPoints,
  mockLoyaltyTransactions,
  mockUserDashboardStats,
} from '@/data/user-management-mock'
import RevenueChart from '@/components/shared/revenue-chart'

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'User Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'loyalty', label: 'Loyalty Points', icon: <Gift size={18} /> },
    { id: 'users', label: 'User List', icon: <Users size={18} /> },
    { id: 'user-analysis', label: 'User Analysis', icon: <BarChart3 size={18} /> },
    { id: 'loyalty-analysis', label: 'Loyalty Analysis', icon: <PieChart size={18} /> },
  ]

  const userStats = [
    {
      title: 'Total Clients',
      value: mockUserDashboardStats.totalClients.toString(),
      icon: Users,
      trend: { value: `+${mockUserDashboardStats.newClientsThisMonth}`, isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active Clients',
      value: mockUserDashboardStats.activeClients.toString(),
      icon: UserCheck,
      trend: { value: `${((mockUserDashboardStats.activeClients / mockUserDashboardStats.totalClients) * 100).toFixed(0)}%`, isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Total Loyalty Points',
      value: (mockUserDashboardStats.totalLoyaltyPoints / 1000).toFixed(0) + 'K',
      icon: Award,
      trend: { value: `Avg: ${mockUserDashboardStats.averageLoyaltyPoints}`, isPositive: true },
      color: colors.adminWarning,
    },
    {
      title: 'Top Tier Clients',
      value: mockUserDashboardStats.topTierClients.toString(),
      icon: TrendingUp,
      trend: { value: `${((mockUserDashboardStats.topTierClients / mockUserDashboardStats.totalClients) * 100).toFixed(0)}%`, isPositive: true },
      color: colors.adminAccent,
    },
  ]

  // User growth data (last 7 days)
  const userGrowthData = [
    { day: 'Mon', revenue: 12 },
    { day: 'Tue', revenue: 15 },
    { day: 'Wed', revenue: 8 },
    { day: 'Thu', revenue: 18 },
    { day: 'Fri', revenue: 22 },
    { day: 'Sat', revenue: 14 },
    { day: 'Sun', revenue: 10 },
  ]

  // Loyalty points earned data (last 7 days)
  const loyaltyPointsData = [
    { day: 'Mon', revenue: 450 },
    { day: 'Tue', revenue: 620 },
    { day: 'Wed', revenue: 380 },
    { day: 'Thu', revenue: 710 },
    { day: 'Fri', revenue: 890 },
    { day: 'Sat', revenue: 540 },
    { day: 'Sun', revenue: 420 },
  ]

  // User activity by role
  const userActivityByRole = [
    { role: 'Admin', count: 1, percentage: 20 },
    { role: 'Supervisor', count: 1, percentage: 20 },
    { role: 'Agent', count: 1, percentage: 20 },
    { role: 'Client', count: 2, percentage: 40 },
  ]

  // Loyalty tier distribution
  const loyaltyTierDistribution = [
    { tier: 'Platinum', count: 1, percentage: 25, color: colors.adminPrimary },
    { tier: 'Gold', count: 1, percentage: 25, color: colors.adminWarning },
    { tier: 'Silver', count: 1, percentage: 25, color: colors.textSecondary },
    { tier: 'Bronze', count: 1, percentage: 25, color: '#CD7F32' },
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return colors.adminPrimary
      case 'Gold':
        return colors.adminWarning
      case 'Silver':
        return colors.textSecondary
      case 'Bronze':
        return '#CD7F32'
      default:
        return colors.textTertiary
    }
  }

  return (
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              User Management
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Manage users, loyalty points, and loan applications
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <TabPanel>
            {/* User Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {userStats.map((stat, index) => (
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

            {/* Client Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <DashboardCard title="Top Clients" subtitle="Clients with highest loyalty points">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Tier
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Loyalty Points
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Total Contracts
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Total Spent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockClientUsers.slice(0, 5).map((client, index) => (
                        <motion.tr
                          key={client.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ borderColor: colors.borderLight }}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium" style={{ color: colors.textPrimary }}>
                                {client.name}
                              </p>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                {client.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${getTierColor(client.loyaltyTier)}20`,
                                color: getTierColor(client.loyaltyTier),
                              }}
                            >
                              {client.loyaltyTier}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold" style={{ color: colors.adminPrimary }}>
                            {client.loyaltyPoints.toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {client.totalContracts}
                          </td>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                            KSh {client.totalSpent.toLocaleString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </motion.div>
          </TabPanel>
        )}

        {activeTab === 'loyalty' && (
          <TabPanel>
            {/* Loyalty Points List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <DashboardCard
                title="Loyalty Points Overview"
                subtitle="All client loyalty points and tiers"
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
                        placeholder="Search clients..."
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                        style={{ borderColor: colors.borderLight }}
                      />
                    </div>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Current Tier
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Total Points
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Points Earned
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Points Redeemed
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Next Tier
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLoyaltyPoints.map((loyalty, index) => (
                        <motion.tr
                          key={loyalty.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ borderColor: colors.borderLight }}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium" style={{ color: colors.textPrimary }}>
                                {loyalty.clientName}
                              </p>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                {loyalty.clientEmail}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${getTierColor(loyalty.currentTier)}20`,
                                color: getTierColor(loyalty.currentTier),
                              }}
                            >
                              {loyalty.currentTier}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold" style={{ color: colors.adminPrimary }}>
                            {loyalty.totalPoints.toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.adminSuccess }}>
                            +{loyalty.pointsEarned.toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.adminError }}>
                            -{loyalty.pointsRedeemed.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {loyalty.pointsToNextTier > 0 ? (
                              <span className="text-sm" style={{ color: colors.textSecondary }}>
                                {loyalty.pointsToNextTier} to {loyalty.nextTier}
                              </span>
                            ) : (
                              <span className="text-sm font-medium" style={{ color: colors.adminSuccess }}>
                                Max Tier
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </motion.div>
          </TabPanel>
        )}

        {activeTab === 'users' && (
          <TabPanel>
            {/* All Users List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <DashboardCard
                title="All Users"
                subtitle="Manage system users and their roles"
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
                        placeholder="Search users..."
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
                          User ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Phone
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Last Login
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                          className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ borderColor: colors.borderLight }}
                        >
                          <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                            {user.id}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {user.name}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {user.email}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {user.phone}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  user.role === 'Admin'
                                    ? `${colors.adminError}20`
                                    : user.role === 'Supervisor'
                                    ? `${colors.adminWarning}20`
                                    : user.role === 'Client'
                                    ? `${colors.adminPrimary}20`
                                    : `${colors.adminSuccess}20`,
                                color:
                                  user.role === 'Admin'
                                    ? colors.adminError
                                    : user.role === 'Supervisor'
                                    ? colors.adminWarning
                                    : user.role === 'Client'
                                    ? colors.adminPrimary
                                    : colors.adminSuccess,
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: user.status === 'Active' ? `${colors.adminSuccess}20` : `${colors.textTertiary}20`,
                                color: user.status === 'Active' ? colors.adminSuccess : colors.textTertiary,
                              }}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {user.lastLogin || 'Never'}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </motion.div>
          </TabPanel>
        )}

        {activeTab === 'user-analysis' && (
          <TabPanel>
            {/* User Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* User Growth Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <DashboardCard title="User Growth" subtitle="New users registered (Last 7 days)">
                  <RevenueChart data={userGrowthData} height={256} />
                </DashboardCard>
              </motion.div>

              {/* User Activity by Role */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <DashboardCard title="User Distribution by Role" subtitle="Active users by role">
                  <div className="space-y-4 pt-4">
                    {userActivityByRole.map((item, index) => (
                      <motion.div
                        key={item.role}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium" style={{ color: colors.textPrimary }}>
                            {item.role}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: colors.adminPrimary }}>
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                item.role === 'Admin'
                                  ? colors.adminError
                                  : item.role === 'Supervisor'
                                  ? colors.adminWarning
                                  : item.role === 'Client'
                                  ? colors.adminPrimary
                                  : colors.adminSuccess,
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </DashboardCard>
              </motion.div>
            </div>

            {/* User Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <DashboardCard title="Recent User Activity" subtitle="Latest user registrations and updates">
                <div className="space-y-4">
                  {mockUsers.slice(0, 5).map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{
                            backgroundColor:
                              user.role === 'Admin'
                                ? colors.adminError
                                : user.role === 'Supervisor'
                                ? colors.adminWarning
                                : user.role === 'Client'
                                ? colors.adminPrimary
                                : colors.adminSuccess,
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: colors.textPrimary }}>
                            {user.name}
                          </p>
                          <p className="text-sm" style={{ color: colors.textSecondary }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              user.role === 'Admin'
                                ? `${colors.adminError}20`
                                : user.role === 'Supervisor'
                                ? `${colors.adminWarning}20`
                                : user.role === 'Client'
                                ? `${colors.adminPrimary}20`
                                : `${colors.adminSuccess}20`,
                            color:
                              user.role === 'Admin'
                                ? colors.adminError
                                : user.role === 'Supervisor'
                                ? colors.adminWarning
                                : user.role === 'Client'
                                ? colors.adminPrimary
                                : colors.adminSuccess,
                          }}
                        >
                          {user.role}
                        </span>
                        <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                          {user.lastLogin || 'Never logged in'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </DashboardCard>
            </motion.div>
          </TabPanel>
        )}

        {activeTab === 'loyalty-analysis' && (
          <TabPanel>
            {/* Loyalty Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Loyalty Points Earned Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <DashboardCard title="Loyalty Points Earned" subtitle="Points earned by clients (Last 7 days)">
                  <RevenueChart data={loyaltyPointsData} height={256} />
                </DashboardCard>
              </motion.div>

              {/* Loyalty Tier Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <DashboardCard title="Loyalty Tier Distribution" subtitle="Clients by loyalty tier">
                  <div className="space-y-4 pt-4">
                    {loyaltyTierDistribution.map((item, index) => (
                      <motion.div
                        key={item.tier}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium" style={{ color: colors.textPrimary }}>
                            {item.tier}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: item.color }}>
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </DashboardCard>
              </motion.div>
            </div>

            {/* Recent Loyalty Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <DashboardCard title="Recent Loyalty Transactions" subtitle="Latest points earned and redeemed">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Transaction ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Client
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Type
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Points
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Description
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLoyaltyTransactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                          className="border-b hover:bg-gray-50 transition-colors"
                          style={{ borderColor: colors.borderLight }}
                        >
                          <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                            {transaction.id}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium" style={{ color: colors.textPrimary }}>
                                {transaction.clientName}
                              </p>
                              <p className="text-sm" style={{ color: colors.textSecondary }}>
                                ID: {transaction.clientId}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  transaction.type === 'Earned' ? `${colors.adminSuccess}20` : `${colors.adminWarning}20`,
                                color: transaction.type === 'Earned' ? colors.adminSuccess : colors.adminWarning,
                              }}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold" style={{ color: transaction.type === 'Earned' ? colors.adminSuccess : colors.adminWarning }}>
                            {transaction.type === 'Earned' ? '+' : '-'}
                            {transaction.points}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                            {transaction.reason}
                          </td>
                          <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </motion.div>
          </TabPanel>
        )}
      </motion.div>
    
  )
}
