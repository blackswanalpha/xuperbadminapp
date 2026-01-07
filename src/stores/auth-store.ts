
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
    id: number
    email: string
    name: string
    role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'CLIENT' | 'STAFF'
    branchId?: string
    status: string
    profileImageUrl?: string
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    setUser: (user: User | null) => void
    setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true, // Start as true, set to false after hydration
            isAuthenticated: false,

            setUser: (user) => set({ user, isAuthenticated: !!user && !!get().token }),
            setToken: (token) => set({ token, isAuthenticated: !!get().user && !!token }),

            login: async (email: string, password: string) => {
                try {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://xuperb.spinwish.tech/api/v1').replace(/\/?$/, '');
                    const response = await fetch(`${baseUrl}/users/auth/login/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || 'Login failed')
                    }

                    const data = await response.json()

                    // Calculate expiry
                    const expiryDate = new Date()
                    expiryDate.setDate(expiryDate.getDate() + 30)
                    localStorage.setItem('rememberMeExpiry', expiryDate.toISOString())

                    set({
                        token: data.access,
                        user: data.user,
                        isAuthenticated: true,
                    })
                } catch (error) {
                    console.error('Login error:', error)
                    throw error
                }
            },

            logout: async () => {
                const { token } = get()
                try {
                    if (token) {
                        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://xuperb.spinwish.tech/api/v1').replace(/\/?$/, '');
                        await fetch(`${baseUrl}/users/auth/logout/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        })
                    }
                } catch (error) {
                    console.error('Logout API error:', error)
                }

                if (typeof window !== 'undefined') {
                    const keysToRemove = [
                        'rememberMeExpiry',
                        'token',
                        'access_token',
                        'authToken',
                        'user'
                    ];
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                    // Note: auth-storage is handled by Zustand persist middleware
                }

                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })
            },
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }), // Only persist these fields
            onRehydrateStorage: () => (state) => {
                // Hydration finished
                if (state) {
                    state.isLoading = false

                    // Check expiry
                    const rememberMeExpiry = localStorage.getItem('rememberMeExpiry')
                    if (rememberMeExpiry) {
                        const expiryDate = new Date(rememberMeExpiry)
                        if (new Date() > expiryDate) {
                            // Expired
                            state.user = null
                            state.token = null
                            state.isAuthenticated = false
                            localStorage.removeItem('rememberMeExpiry')
                        }
                    }
                }
            },
        },
    ),
)
