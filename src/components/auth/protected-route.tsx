'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { colors } from '@/lib/theme/colors'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') {
          router.push('/admin')
        } else if (user.role === 'SUPERVISOR') {
          router.push('/supervisor')
        } else {
          router.push(redirectTo)
        }
        return
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: colors.textSecondary }}>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: colors.textSecondary }}>Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}