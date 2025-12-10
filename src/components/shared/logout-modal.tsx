'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userRole?: 'admin' | 'supervisor'
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userRole = 'admin'
}: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } catch (error) {
      console.error('Logout failed:', error)
    }
    setIsLoading(false)
  }

  const getPrimaryColor = () => {
    return userRole === 'admin' ? colors.adminPrimary : colors.supervisorPrimary
  }

  const getErrorColor = () => {
    return colors.adminError
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-lg w-full max-w-md overflow-hidden"
              style={{ boxShadow: designTokens.shadows.lg }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getErrorColor()}15` }}
                  >
                    <LogOut size={20} style={{ color: getErrorColor() }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    Confirm Logout
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  <X size={20} style={{ color: colors.textSecondary }} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p style={{ color: colors.textSecondary }} className="mb-4">
                  Are you sure you want to log out? You'll need to sign in again to access your dashboard.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: getPrimaryColor() }}
                    >
                      {userRole === 'admin' ? 'A' : 'S'}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {userRole === 'admin' ? 'Admin User' : 'Supervisor User'}
                      </p>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Currently signed in
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium border transition-colors"
                  style={{
                    borderColor: colors.borderMedium,
                    color: colors.textPrimary,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = colors.surfaceVariant
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: getErrorColor(),
                    opacity: isLoading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.opacity = '0.9'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}