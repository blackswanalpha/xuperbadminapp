'use client'

import { useUIStore } from '@/stores/ui-store'
import AdminSidebar from '@/components/layout/sidebar/admin-sidebar'
import Header from '@/components/layout/header/header'
import ProtectedRoute from '@/components/auth/protected-route'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  const sidebarWidth = isSidebarOpen ? 270 : 80

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Header */}
        <Header sidebarWidth={sidebarWidth} userRole="admin" />

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