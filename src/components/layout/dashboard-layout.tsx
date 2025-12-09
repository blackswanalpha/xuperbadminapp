'use client'

import { useState } from 'react'
import Sidebar from './sidebar/sidebar'
import Header from './header/header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sidebarWidth = isSidebarOpen ? 270 : 80

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Header */}
      <Header sidebarWidth={sidebarWidth} />

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
  )
}

