'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT' | 'CLIENT' | 'STAFF'
  branchId?: string
  status: string
  profileImageUrl?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!token

  // Load auth data from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const rememberMeExpiry = localStorage.getItem('rememberMeExpiry')

    if (savedToken && savedUser) {
      try {
        // Check if remember me has expired
        if (rememberMeExpiry) {
          const expiryDate = new Date(rememberMeExpiry)
          if (new Date() > expiryDate) {
            // Remember me has expired, clear auth data
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('rememberMeExpiry')
            setIsLoading(false)
            return
          }
        }

        const parsedUser = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('rememberMeExpiry')
      }
    }
    setIsLoading(false)
  }, [])

  // Save auth data to localStorage when changed
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [token, user])

  const login = async (email: string, password: string, rememberMe?: boolean) => {
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
      
      setToken(data.access)
      setUser(data.user)

      // Handle remember me functionality
      if (rememberMe) {
        // Set expiry to 30 days from now
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 30)
        localStorage.setItem('rememberMeExpiry', expiryDate.toISOString())
      } else {
        // Clear remember me if not checked
        localStorage.removeItem('rememberMeExpiry')
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (data.user.role === 'SUPERVISOR') {
        router.push('/supervisor')
      } else {
        router.push('/admin') // Default fallback
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call logout API if needed
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
      // Continue with local logout even if API fails
    }

    // Clear local state and storage
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberMeExpiry')
    
    // Redirect to login
    router.push('/login')
  }

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    setUser,
    setToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}