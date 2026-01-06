
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
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1031/api/v1'}/users/auth/login/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email, password }),
                    })

                    if (!response.ok) {
                        throw new Error('Login failed')
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
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1031/api/v1'}/users/auth/logout/`, {
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

                localStorage.removeItem('rememberMeExpiry')
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                })

                // We rely on the component using this to redirect, or we can't easily redirect from here without a router instance.
                // The original context used router.push('/login').
                // With zustand, it's better to handle redirection in the UI or use a service navigation helper. 
                // For now, consumers will handle redirection if they observe isAuthenticated becoming false.
                // OR we can just simple window.location.href assignment if we really want to force it, but that's a full reload.
                // Let's stick to state change and let the ProtectedRoute component handle the redirect.
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
