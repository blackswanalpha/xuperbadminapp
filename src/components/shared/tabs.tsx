'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { colors } from '@/lib/theme/colors'

export interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`border-b ${className}`} style={{ borderColor: colors.borderLight }}>
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative px-6 py-3 font-medium text-sm transition-colors flex items-center gap-2"
              style={{
                color: isActive ? colors.adminPrimary : colors.textSecondary,
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: colors.adminPrimary }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TabPanelProps {
  children: ReactNode
  className?: string
}

export function TabPanel({ children, className = '' }: TabPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

