'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import SplashScreen from '@/components/splash-screen'

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin')
        } else if (user.role === 'SUPERVISOR') {
          router.push('/supervisor')
        } else {
          router.push('/login')
        }
      } else {
        // Not authenticated, show splash screen
        // User can navigate to login from here
      }
    }
  }, [user, isLoading, isAuthenticated, router])

  return <SplashScreen />
}
