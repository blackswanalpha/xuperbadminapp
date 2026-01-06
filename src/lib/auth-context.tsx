'use client'

import React, { ReactNode } from 'react'
import { useAuthStore, User } from '@/stores/auth-store'

// Re-export User type
export type { User }

// Backward compatibility interface (optional, but good for reference)
export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

// Deprecated: AuthProvider is no longer needed with Zustand, but kept for compatibility during migration
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// Re-export the store hook as useAuth
export const useAuth = useAuthStore