'use client'

import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import LogoutModal from '@/components/shared/logout-modal'

interface HeaderProps {
  sidebarWidth: number
  userRole?: 'admin' | 'supervisor'
}

export default function Header({ sidebarWidth, userRole = 'admin' }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { user, logout } = useAuth()
  
  const getRoleDisplayName = () => {
    return user?.name || (userRole === 'admin' ? 'Admin' : 'Supervisor')
  }
  
  const getRoleColor = () => {
    return userRole === 'admin' ? colors.adminPrimary : colors.supervisorPrimary
  }

  const handleLogoutClick = () => {
    setShowProfileMenu(false)
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    await logout()
    setShowLogoutModal(false)
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-6"
      style={{
        left: `${sidebarWidth}px`,
        boxShadow: designTokens.shadows.xs,
      }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: colors.textTertiary }}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: colors.borderLight,
              color: colors.textPrimary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.adminPrimary
              e.target.style.boxShadow = `0 0 0 3px ${colors.adminPrimary}20`
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.borderLight
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} style={{ color: colors.textSecondary }} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.adminError }}
          />
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: getRoleColor() }}
            >
              {userRole === 'admin' ? 'A' : 'S'}
            </div>
            <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
              {getRoleDisplayName()}
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 overflow-hidden"
              style={{ boxShadow: designTokens.shadows.md }}
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <User size={18} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textPrimary }}>
                  Profile
                </span>
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => setShowProfileMenu(false)}
              >
                <Settings size={18} style={{ color: colors.textSecondary }} />
                <span className="text-sm" style={{ color: colors.textPrimary }}>
                  Settings
                </span>
              </button>
              <div className="border-t border-gray-200" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={handleLogoutClick}
              >
                <LogOut size={18} style={{ color: colors.adminError }} />
                <span className="text-sm" style={{ color: colors.adminError }}>
                  Logout
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        userRole={userRole}
      />
    </header>
  )
}

