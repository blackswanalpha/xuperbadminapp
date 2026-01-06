'use client'

import { useState, useEffect } from 'react'
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
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import { colors } from '@/lib/theme/colors'
import api from '@/lib/axios'
import {
  fetchUsers,
  fetchClientUsers,
  fetchLoyaltyPoints,
  fetchLoyaltyTransactions,
  fetchUserDashboardStats,
  deleteUser,
} from '@/lib/api'
import {
  User,
  ClientUser,
  LoyaltyPoints,
  LoyaltyTransaction,
  UserDashboardStats,
} from '@/types/user-management'
import RevenueChart from '@/components/shared/revenue-chart'

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([])
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints[]>([])
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([])
  const [userDashboardStats, setUserDashboardStats] = useState<UserDashboardStats>({
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    totalLoyaltyPoints: 0,
    averageLoyaltyPoints: 0,
    topTierClients: 0,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const pageSize = 10

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Fetch paginated users data
  const fetchUsersData = async (page = 1, search = '', roleFilter = '', statusFilter = '') => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('page_size', pageSize.toString())
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)

      // Fetch users with pagination
      const response = await api.get(`/users/?${params.toString()}`)
      const usersData = response.data.results || response.data
      const totalCount = response.data.count || usersData.length

      setUsers(usersData)
      setTotalUsers(totalCount)
      setTotalPages(Math.ceil(totalCount / pageSize))

    } catch (err: any) {
      console.error('Error fetching users data:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch users data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [clientUsersData, loyaltyPointsData, loyaltyTransactionsData, dashboardStatsData] = await Promise.all([
        fetchClientUsers(),
        fetchLoyaltyPoints(),
        fetchLoyaltyTransactions({ limit: 10 }),
        fetchUserDashboardStats(),
      ])

      setClientUsers(clientUsersData.results || [])
      setLoyaltyPoints(loyaltyPointsData)
      setLoyaltyTransactions(loyaltyTransactionsData)
      setUserDashboardStats(dashboardStatsData)
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsersData(currentPage, searchQuery, roleFilter, statusFilter)
    } else {
      fetchDashboardData()
    }
  }, [activeTab, currentPage, searchQuery, roleFilter, statusFilter])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page
  }

  // Handle filter changes
  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId)
        // Refresh data after deletion
        await fetchUsersData(currentPage, searchQuery, roleFilter, statusFilter)
      } catch (err: any) {
        console.error('Error deleting user:', err)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

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
      value: userDashboardStats.totalClients.toString(),
      icon: Users,
      trend: { value: `+${userDashboardStats.newClientsThisMonth}`, isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active Clients',
      value: userDashboardStats.activeClients.toString(),
      icon: UserCheck,
      trend: { value: `${userDashboardStats.totalClients > 0 ? ((userDashboardStats.activeClients / userDashboardStats.totalClients) * 100).toFixed(0) : 0}%`, isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Total Loyalty Points',
      value: (userDashboardStats.totalLoyaltyPoints / 1000).toFixed(0) + 'K',
      icon: Award,
      trend: { value: `Avg: ${userDashboardStats.averageLoyaltyPoints}`, isPositive: true },
      color: colors.adminWarning,
    },
    {
      title: 'Top Tier Clients',
      value: userDashboardStats.topTierClients.toString(),
      icon: TrendingUp,
      trend: { value: `${userDashboardStats.totalClients > 0 ? ((userDashboardStats.topTierClients / userDashboardStats.totalClients) * 100).toFixed(0) : 0}%`, isPositive: true },
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

  // User activity by role - calculated from actual users data
  const calculateUserActivityByRole = () => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = users.length || 1

    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / total) * 100)
    }))
  }

  const userActivityByRole = calculateUserActivityByRole()

  // Helper function for tier colors - defined before use
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

  // Loyalty tier distribution - calculated from actual loyalty data
  const calculateLoyaltyTierDistribution = () => {
    const tierCounts = loyaltyPoints.reduce((acc, loyalty) => {
      acc[loyalty.currentTier] = (acc[loyalty.currentTier] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = loyaltyPoints.length || 1

    return Object.entries(tierCounts).map(([tier, count]) => ({
      tier,
      count,
      percentage: Math.round((count / total) * 100),
      color: getTierColor(tier)
    }))
  }

  const loyaltyTierDistribution = calculateLoyaltyTierDistribution()

  // Error component
  if (error && activeTab === 'users') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
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
            Manage users, loyalty points, and user accounts
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: colors.adminPrimary }}
          onClick={() => window.location.href = '/admin/user-management/add'}
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
                    {clientUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                          No clients found
                        </td>
                      </tr>
                    ) : (
                      clientUsers.slice(0, 5).map((client, index) => (
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
                                backgroundColor: `${getTierColor(client.loyaltyTier || 'Bronze')}20`,
                                color: getTierColor(client.loyaltyTier || 'Bronze'),
                              }}
                            >
                              {client.loyaltyTier || 'Bronze'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold" style={{ color: colors.adminPrimary }}>
                            {(client.loyaltyPoints || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                            {client.totalContracts || 0}
                          </td>
                          <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                            KSh {(client.totalSpent || 0).toLocaleString()}
                          </td>
                        </motion.tr>
                      ))
                    )}
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
                    {loyaltyPoints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                          No loyalty points data found
                        </td>
                      </tr>
                    ) : (
                      loyaltyPoints.map((loyalty, index) => (
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
                      )))}
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
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                      style={{ borderColor: colors.borderLight }}
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Agent">Agent</option>
                    <option value="Staff">Staff</option>
                    <option value="Client">Client</option>
                    <option value="Supplier">Supplier</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>

                  <button
                    className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: colors.borderLight }}
                    title="More options"
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
                      <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2" style={{ color: colors.textSecondary }}>Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                          {searchQuery || roleFilter || statusFilter ? 'No users found matching your criteria' : 'No users found'}
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="border-b hover:bg-gray-50 transition-colors"
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
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                style={{ color: colors.adminPrimary }}
                                title="View Details"
                                onClick={() => window.location.href = `/admin/user-management/${user.id}`}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                                style={{ color: colors.adminSuccess }}
                                title="Edit User"
                                onClick={() => window.location.href = `/admin/user-management/${user.id}/edit`}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                style={{ color: colors.adminError }}
                                title="Delete User"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      )))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${pageNum === currentPage
                              ? 'text-white'
                              : 'border hover:bg-gray-50'
                            }`}
                          style={{
                            backgroundColor: pageNum === currentPage ? colors.adminPrimary : 'transparent',
                            borderColor: pageNum === currentPage ? colors.adminPrimary : colors.borderLight,
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
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
                {users.length === 0 ? (
                  <div className="py-8 text-center" style={{ color: colors.textSecondary }}>
                    No user activity found
                  </div>
                ) : (
                  users.slice(0, 5).map((user, index) => (
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
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never logged in'}
                        </p>
                      </div>
                    </motion.div>
                  )))}
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
                    {loyaltyTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                          No loyalty transactions found
                        </td>
                      </tr>
                    ) : (
                      loyaltyTransactions.map((transaction, index) => (
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
                      )))}
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