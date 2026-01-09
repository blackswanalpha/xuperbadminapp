'use client'

import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Car,
  DollarSign,
  FileText,
  Award,
  TrendingUp,
  Edit3,
  Trash2,
  UserCheck,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Package,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  History,
  Settings,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import { colors } from '@/lib/theme/colors'
import {
  fetchUser,
  fetchClientLoyaltyPoints,
  fetchLoyaltyTransactions,
  fetchAllContracts,
  deleteUser,
} from '@/lib/api'
import {
  User as UserType,
  LoyaltyPoints,
  LoyaltyTransaction,
  ClientUser,
} from '@/types/user-management'


interface UserDetailTabContent {
  id: string
  label: string
  icon: JSX.Element
  component: JSX.Element
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // User data state
  const [user, setUser] = useState<UserType | null>(null)
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPoints | null>(null)
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [userActivities, setUserActivities] = useState<any[]>([])

  // Fetch user details
  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const userData = await fetchUser(userId)
      setUser(userData)

      // Fetch role-specific data
      if (userData.role === 'Client') {
        await fetchClientSpecificData(userId)
      } else if (userData.role === 'Agent') {
        await fetchAgentSpecificData(userId)
      } else if (userData.role === 'Driver') {
        await fetchStaffSpecificData(userId)
      } else if (userData.role === 'Supervisor') {
        await fetchSupervisorSpecificData(userId)
      } else if (userData.role === 'Admin') {
        await fetchAdminSpecificData(userId)
      }

      // Create mock activities based on user data since /users/activity/ doesn't exist
      const mockActivities = [
        {
          id: '1',
          title: 'User Account Created',
          description: `${userData.role} account was created successfully`,
          time: userData.createdAt || new Date().toISOString(),
          type: 'account'
        },
        {
          id: '2',
          title: 'Profile Updated',
          description: 'User profile information was updated',
          time: userData.updatedAt || new Date().toISOString(),
          type: 'profile'
        },
        {
          id: '3',
          title: 'Last Login',
          description: userData.lastLogin ? 'User logged into the system' : 'User has not logged in yet',
          time: userData.lastLogin || userData.createdAt || new Date().toISOString(),
          type: 'auth'
        }
      ]
      setUserActivities(mockActivities)

    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch client-specific data
  const fetchClientSpecificData = async (clientId: string) => {
    try {
      // Fetch client loyalty points
      try {
        const loyaltyPointsData = await fetchClientLoyaltyPoints(clientId)
        setLoyaltyData(loyaltyPointsData)
      } catch (err) {
        console.warn('Loyalty points data not available for client:', err)
      }

      // Fetch loyalty transactions
      try {
        const loyaltyTransactionsData = await fetchLoyaltyTransactions({ clientId, limit: 20 })
        setLoyaltyTransactions(loyaltyTransactionsData)
      } catch (err) {
        console.warn('Loyalty transactions data not available for client:', err)
      }

      // Fetch client contracts
      try {
        const clientContracts = await fetchAllContracts({ search: clientId })
        setContracts(clientContracts)
      } catch (err) {
        console.warn('Contracts data not available for client:', err)
      }
    } catch (err) {
      console.error('Error fetching client data:', err)
    }
  }

  // Fetch agent-specific data
  const fetchAgentSpecificData = async (agentId: string) => {
    try {
      // Fetch contracts where this agent is involved
      const agentContracts = await fetchAllContracts({ search: agentId })
      setContracts(agentContracts)
    } catch (err) {
      console.warn('Contracts data not available for agent:', err)
      setContracts([]) // Set empty array as fallback
    }
  }

  // Fetch staff/driver-specific data
  const fetchStaffSpecificData = async (staffId: string) => {
    try {
      // Fetch contracts where this staff member is the driver
      const driverContracts = await fetchAllContracts({ search: staffId })
      setContracts(driverContracts)
    } catch (err) {
      console.warn('Contracts data not available for staff:', err)
      setContracts([]) // Set empty array as fallback
    }
  }

  // Fetch supervisor-specific data
  const fetchSupervisorSpecificData = async (supervisorId: string) => {
    try {
      // Supervisors would have broader access to data
      const supervisorContracts = await fetchAllContracts({ page_size: 50 })
      setContracts(supervisorContracts)
    } catch (err) {
      console.warn('Contracts data not available for supervisor:', err)
      setContracts([]) // Set empty array as fallback
    }
  }

  // Fetch admin-specific data
  const fetchAdminSpecificData = async (adminId: string) => {
    try {
      // Admins have access to all data
      const allContracts = await fetchAllContracts({ page_size: 100 })
      setContracts(allContracts)
    } catch (err) {
      console.warn('Contracts data not available for admin:', err)
      setContracts([]) // Set empty array as fallback
    }
  }

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete ${user?.name}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId)
        alert('User deleted successfully')
        router.push('/admin/user-management')
      } catch (err: any) {
        console.error('Error deleting user:', err)
        alert('Failed to delete user. Please try again.')
      }
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return colors.adminError
      case 'Supervisor': return colors.adminWarning
      case 'Client': return colors.adminPrimary
      case 'Agent': return colors.adminSuccess
      case 'Staff': return colors.adminAccent
      case 'Supplier': return colors.textSecondary
      default: return colors.textTertiary
    }
  }

  // Helper function to get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return colors.adminPrimary
      case 'Gold': return colors.adminWarning
      case 'Silver': return colors.textSecondary
      case 'Bronze': return '#CD7F32'
      default: return colors.textTertiary
    }
  }

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* User Stats Cards - Role Specific */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'Client' && (
          <>
            <StatCard
              title="Loyalty Points"
              value={(loyaltyData?.totalPoints || 0).toLocaleString()}
              icon={Award}
              trend={{ value: loyaltyData?.currentTier || 'Bronze', isPositive: true }}
              color={getTierColor(loyaltyData?.currentTier || 'Bronze')}
            />
            <StatCard
              title="Total Contracts"
              value={contracts.length.toString()}
              icon={FileText}
              trend={{ value: `${contracts.filter(c => c.status === 'Active').length} Active`, isPositive: true }}
              color={colors.adminPrimary}
            />
            <StatCard
              title="Total Spent"
              value={`KSh ${contracts.reduce((sum, c) => sum + parseFloat(c.total_contract_value || '0'), 0).toLocaleString()}`}
              icon={DollarSign}
              color={colors.adminSuccess}
            />
            <StatCard
              title="Account Status"
              value={user.status}
              icon={user.status === 'Active' ? CheckCircle : XCircle}
              color={user.status === 'Active' ? colors.adminSuccess : colors.adminError}
            />
          </>
        )}

        {user?.role === 'Agent' && (
          <>
            <StatCard
              title="Managed Contracts"
              value={contracts.length.toString()}
              icon={FileText}
              trend={{ value: `${contracts.filter(c => c.status === 'Active').length} Active`, isPositive: true }}
              color={colors.adminPrimary}
            />
            <StatCard
              title="Total Value Managed"
              value={`KSh ${contracts.reduce((sum, c) => sum + parseFloat(c.total_contract_value || '0'), 0).toLocaleString()}`}
              icon={DollarSign}
              color={colors.adminSuccess}
            />
            <StatCard
              title="Performance Rating"
              value="4.8/5"
              icon={Star}
              color={colors.adminWarning}
            />
            <StatCard
              title="Account Status"
              value={user.status}
              icon={user.status === 'Active' ? CheckCircle : XCircle}
              color={user.status === 'Active' ? colors.adminSuccess : colors.adminError}
            />
          </>
        )}

        {(user?.role === 'Driver') && (
          <>
            <StatCard
              title="Assigned Vehicles"
              value={contracts.length.toString()}
              icon={Car}
              trend={{ value: `${contracts.filter(c => c.status === 'Active').length} Active`, isPositive: true }}
              color={colors.adminPrimary}
            />
            <StatCard
              title="Driving Experience"
              value="3 Years"
              icon={Clock}
              color={colors.adminSuccess}
            />
            <StatCard
              title="Performance Rating"
              value="4.6/5"
              icon={Star}
              color={colors.adminWarning}
            />
            <StatCard
              title="Account Status"
              value={user.status}
              icon={user.status === 'Active' ? CheckCircle : XCircle}
              color={user.status === 'Active' ? colors.adminSuccess : colors.adminError}
            />
          </>
        )}

        {(user?.role === 'Supervisor' || user?.role === 'Admin') && (
          <>
            <StatCard
              title="Supervised Contracts"
              value={contracts.length.toString()}
              icon={FileText}
              color={colors.adminPrimary}
            />
            <StatCard
              title="Managed Users"
              value="25"
              icon={Users}
              color={colors.adminSuccess}
            />
            <StatCard
              title="System Access Level"
              value={user.role === 'Admin' ? 'Full Access' : 'Supervisor Access'}
              icon={Shield}
              color={colors.adminWarning}
            />
            <StatCard
              title="Account Status"
              value={user.status}
              icon={user.status === 'Active' ? CheckCircle : XCircle}
              color={user.status === 'Active' ? colors.adminSuccess : colors.adminError}
            />
          </>
        )}
      </div>

      {/* User Information Card */}
      <DashboardCard title="Personal Information" subtitle="User details and contact information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={18} style={{ color: colors.adminPrimary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Full Name</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} style={{ color: colors.adminPrimary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Email Address</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} style={{ color: colors.adminPrimary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Phone Number</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>{user?.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield size={18} style={{ color: colors.adminPrimary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Role</p>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getRoleColor(user?.role || '')}20`,
                    color: getRoleColor(user?.role || ''),
                  }}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            {(user?.role === 'Client' && (user as ClientUser).idNumber) && (
              <div className="flex items-center gap-3">
                <CreditCard size={18} style={{ color: colors.adminPrimary }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>ID Number</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>{(user as ClientUser).idNumber}</p>
                </div>
              </div>
            )}

            {(user?.role === 'Client' && (user as ClientUser).physicalAddress) && (
              <div className="flex items-center gap-3">
                <MapPin size={18} style={{ color: colors.adminPrimary }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Physical Address</p>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>{(user as ClientUser).physicalAddress}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar size={18} style={{ color: colors.adminPrimary }} />
              <div>
                <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>Member Since</p>
                <p className="font-semibold" style={{ color: colors.textPrimary }}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )

  // Contracts Tab Component
  const ContractsTab = () => (
    <DashboardCard
      title="Contracts"
      subtitle={`${user?.role === 'Client' ? 'Client' : user?.role === 'Agent' ? 'Managed' : 'Associated'} contracts`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: colors.borderLight }}>
              <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                Contract #
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                {user?.role === 'Client' ? 'Vehicle' : 'Client'}
              </th>
              <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                Duration
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
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                  No contracts found
                </td>
              </tr>
            ) : (
              contracts.map((contract, index) => (
                <motion.tr
                  key={contract.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.borderLight }}
                >
                  <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                    {contract.contract_number}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                    {user?.role === 'Client' ? contract.vehicle : contract.client?.email}
                  </td>
                  <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                    {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold" style={{ color: colors.adminPrimary }}>
                    KSh {parseFloat(contract.total_contract_value || '0').toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: contract.status === 'Active' ? `${colors.adminSuccess}20` : `${colors.textTertiary}20`,
                        color: contract.status === 'Active' ? colors.adminSuccess : colors.textTertiary,
                      }}
                    >
                      {contract.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  )

  // Loyalty Tab Component (Client-specific)
  const LoyaltyTab = () => (
    <div className="space-y-6">
      {loyaltyData && (
        <>
          {/* Loyalty Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Current Tier"
              value={loyaltyData.currentTier}
              icon={Award}
              color={getTierColor(loyaltyData.currentTier)}
            />
            <StatCard
              title="Total Points"
              value={loyaltyData.totalPoints.toLocaleString()}
              icon={Star}
              color={colors.adminPrimary}
            />
            <StatCard
              title="Points to Next Tier"
              value={loyaltyData.pointsToNextTier > 0 ? loyaltyData.pointsToNextTier.toString() : 'Max Tier'}
              icon={TrendingUp}
              color={colors.adminSuccess}
            />
          </div>

          {/* Loyalty Transactions */}
          <DashboardCard title="Loyalty Transactions" subtitle="Recent points earned and redeemed">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Points
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loyaltyTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="border-b hover:bg-gray-50 transition-colors"
                      style={{ borderColor: colors.borderLight }}
                    >
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: transaction.type === 'Earned' ? `${colors.adminSuccess}20` : `${colors.adminWarning}20`,
                            color: transaction.type === 'Earned' ? colors.adminSuccess : colors.adminWarning,
                          }}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold" style={{ color: transaction.type === 'Earned' ? colors.adminSuccess : colors.adminWarning }}>
                        {transaction.type === 'Earned' ? '+' : '-'}{transaction.points}
                      </td>
                      <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                        {transaction.reason}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  )

  // Activity Tab Component
  const ActivityTab = () => (
    <DashboardCard title="Recent Activities" subtitle="User activity and system interactions">
      <div className="space-y-4">
        {userActivities.length === 0 ? (
          <div className="py-8 text-center" style={{ color: colors.textSecondary }}>
            No recent activities found
          </div>
        ) : (
          userActivities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-lg border"
              style={{ borderColor: colors.borderLight }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.adminPrimary}20` }}
              >
                <Activity size={18} style={{ color: colors.adminPrimary }} />
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: colors.textPrimary }}>
                  {activity.title || 'System Activity'}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {activity.description || activity.subtitle || 'User performed an action'}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textTertiary }}>
                  {activity.time ? new Date(activity.time).toLocaleString() : 'Unknown time'}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </DashboardCard>
  )

  // Define tabs based on user role
  const getTabsForRole = (role: string): UserDetailTabContent[] => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: <User size={18} />, component: <OverviewTab /> },
      { id: 'activity', label: 'Activity', icon: <Activity size={18} />, component: <ActivityTab /> },
    ]

    const contractsTab = { id: 'contracts', label: 'Contracts', icon: <FileText size={18} />, component: <ContractsTab /> }
    const loyaltyTab = { id: 'loyalty', label: 'Loyalty', icon: <Award size={18} />, component: <LoyaltyTab /> }

    switch (role) {
      case 'Client':
        return [...baseTabs.slice(0, 1), loyaltyTab, contractsTab, ...baseTabs.slice(1)]
      case 'Agent':
      case 'Staff':
      case 'Supervisor':
      case 'Admin':
        return [...baseTabs.slice(0, 1), contractsTab, ...baseTabs.slice(1)]
      default:
        return baseTabs
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: colors.textSecondary }}>Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error || 'User not found'}</span>
          </div>
          <button
            onClick={() => router.push('/admin/user-management')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Back to Users
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const userTabs = getTabsForRole(user.role)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/admin/user-management')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.borderLight }}
          >
            <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: getRoleColor(user.role) }}
              >
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  {user.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getRoleColor(user.role)}20`,
                      color: getRoleColor(user.role),
                    }}
                  >
                    {user.role}
                  </span>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/user-management/${userId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              style={{ borderColor: colors.borderLight }}
            >
              <Edit3 size={16} />
              Edit
            </button>
            <button
              onClick={handleDeleteUser}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.adminError }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={userTabs.map(tab => ({ id: tab.id, label: tab.label, icon: tab.icon }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      {userTabs.map(tab => (
        activeTab === tab.id && (
          <TabPanel key={tab.id}>
            {tab.component}
          </TabPanel>
        )
      ))}
    </motion.div>
  )
}