'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { menuItems } from './menu-items'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar Container */}
      <motion.aside
        initial={{ width: isOpen ? 270 : 80 }}
        animate={{ width: isOpen ? 270 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col"
        style={{
          boxShadow: designTokens.shadows.sm,
        }}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: colors.adminPrimary }}
                >
                  X
                </div>
                <span className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  XuperB
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mini"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold mx-auto"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                X
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          {menuItems.map((item) => {
            // Render subheader
            if (item.subheader) {
              return (
                <div key={item.id} className="px-4 py-2">
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: colors.textTertiary }}
                      >
                        {item.subheader}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.id} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mx-3 my-1 rounded-lg transition-all duration-200 ${
                    isActive ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? colors.adminPrimary : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    <Icon
                      size={20}
                      style={{
                        color: isActive ? colors.textOnPrimary : colors.textSecondary,
                        minWidth: '20px',
                      }}
                    />
                    <AnimatePresence mode="wait">
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium whitespace-nowrap"
                          style={{
                            color: isActive ? colors.textOnPrimary : colors.textPrimary,
                          }}
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="h-12 flex items-center justify-center border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </motion.aside>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 7px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #eff2f7;
          border-radius: 15px;
        }
      `}</style>
    </>
  )
}

