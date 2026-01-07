import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/lib/axios'
import {
    fetchUsers,
    fetchClientUsers,
    fetchLoyaltyPoints,
    fetchLoyaltyTransactions,
    fetchUserDashboardStats,
    deleteUser as deleteUserApi,
} from '@/lib/api'
import {
    User,
    ClientUser,
    LoyaltyPoints,
    LoyaltyTransaction,
    UserDashboardStats,
} from '@/types/user-management'

interface UserState {
    // Data
    users: User[]
    clientUsers: ClientUser[]
    loyaltyPoints: LoyaltyPoints[]
    loyaltyTransactions: LoyaltyTransaction[]
    userDashboardStats: UserDashboardStats

    // Pagination & Filters (for User List)
    currentPage: number
    totalPages: number
    totalUsers: number
    searchQuery: string
    roleFilter: string
    statusFilter: string

    // UI State
    loading: boolean
    error: string | null

    // Actions
    setSearchQuery: (query: string) => void
    setRoleFilter: (role: string) => void
    setStatusFilter: (status: string) => void
    setCurrentPage: (page: number) => void

    fetchUsersData: (page?: number, search?: string, roleFilter?: string, statusFilter?: string) => Promise<void>
    fetchDashboardData: () => Promise<void>
    deleteUser: (userId: string) => Promise<void>
    reset: () => void
}

const initialState = {
    users: [],
    clientUsers: [],
    loyaltyPoints: [],
    loyaltyTransactions: [],
    userDashboardStats: {
        totalClients: 0,
        activeClients: 0,
        newClientsThisMonth: 0,
        totalLoyaltyPoints: 0,
        averageLoyaltyPoints: 0,
        topTierClients: 0,
    },
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    searchQuery: '',
    roleFilter: '',
    statusFilter: '',
    loading: false,
    error: null,
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
            setRoleFilter: (role) => set({ roleFilter: role, currentPage: 1 }),
            setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
            setCurrentPage: (page) => set({ currentPage: page }),

            fetchUsersData: async (page, search, role, status) => {
                const state = get()
                const p = page ?? state.currentPage
                const s = search ?? state.searchQuery
                const r = role ?? state.roleFilter
                const st = status ?? state.statusFilter

                set({ loading: true, error: null })
                try {
                    const params = new URLSearchParams()
                    params.append('page', p.toString())
                    params.append('page_size', '10')
                    if (s) params.append('search', s)
                    if (r) params.append('role', r)
                    if (st) params.append('status', st)

                    const response = await api.get(`/users/?${params.toString()}`)
                    const usersData = response.data.results || response.data
                    const totalCount = response.data.count || usersData.length

                    set({
                        users: usersData,
                        totalUsers: totalCount,
                        totalPages: Math.ceil(totalCount / 10),
                        loading: false,
                    })
                } catch (err: any) {
                    console.error('Error fetching users data:', err)
                    set({
                        error: err?.response?.data?.message || err?.message || 'Failed to fetch users data',
                        loading: false,
                    })
                }
            },

            fetchDashboardData: async () => {
                const state = get()
                try {
                    const [clientUsersData, loyaltyPointsData, loyaltyTransactionsData, dashboardStatsData] = await Promise.all([
                        fetchClientUsers(),
                        fetchLoyaltyPoints(),
                        fetchLoyaltyTransactions({ limit: 10 }),
                        fetchUserDashboardStats(),
                    ])

                    set({
                        clientUsers: clientUsersData.results || [],
                        loyaltyPoints: loyaltyPointsData,
                        loyaltyTransactions: loyaltyTransactionsData,
                        userDashboardStats: dashboardStatsData,
                    })

                    // Also fetch first page of users if not already loaded, needed for charts/activity
                    if (state.users.length === 0) {
                        await state.fetchUsersData(1)
                    }
                } catch (err: any) {
                    console.error('Error fetching dashboard data:', err)
                    // Don't set global error for background dashboard fetch to avoid blocking UI
                }
            },

            deleteUser: async (userId: string) => {
                try {
                    await deleteUserApi(userId)
                    // Refresh current view
                    const state = get()
                    await state.fetchUsersData()
                } catch (err: any) {
                    console.error('Error deleting user:', err)
                    throw err
                }
            },

            reset: () => set(initialState),
        }),
        {
            name: 'user-management-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Optionally persist some filters or dashboard data
                searchQuery: state.searchQuery,
                roleFilter: state.roleFilter,
                statusFilter: state.statusFilter,
            }),
        }
    )
)
