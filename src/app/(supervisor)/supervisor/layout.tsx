'use client'

import { useUIStore } from '@/stores/ui-store'
import SupervisorSidebar from '@/components/layout/sidebar/supervisor-sidebar'
import Header from '@/components/layout/header/header'
import ProtectedRoute from '@/components/auth/protected-route'

interface SupervisorLayoutProps {
  children: React.ReactNode
}

export default function SupervisorLayout({ children }: SupervisorLayoutProps) {
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  const sidebarWidth = isSidebarOpen ? 270 : 80

  return (
    <ProtectedRoute allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-gray-50">
        {/* Supervisor Sidebar */}
        <SupervisorSidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Header */}
        <Header sidebarWidth={sidebarWidth} userRole="supervisor" />

        {/* Main Content */}
        <main
          className="pt-16 transition-all duration-300"
          style={{
            marginLeft: `${sidebarWidth}px`,
          }}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}