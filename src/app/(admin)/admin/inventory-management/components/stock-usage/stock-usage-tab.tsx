'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import StockUsageList from './stock-usage-list'
import AddStockUsageModal from './add-stock-usage-modal'
import ViewStockUsageModal from './view-stock-usage-modal'
import { StockUsage } from '@/types/inventory-api'

export default function StockUsageTab() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewingUsage, setViewingUsage] = useState<StockUsage | null>(null)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAddUsage = () => {
    setShowAddModal(true)
  }

  const handleViewUsage = (usage: StockUsage) => {
    setViewingUsage(usage)
  }

  const handleCloseModals = () => {
    setShowAddModal(false)
    setViewingUsage(null)
  }

  const handleModalSuccess = () => {
    handleRefresh()
    handleCloseModals()
  }

  return (
    <div className="space-y-6">
      <StockUsageList
        onAdd={handleAddUsage}
        onView={handleViewUsage}
        refreshTrigger={refreshTrigger}
      />

      <AnimatePresence>
        {showAddModal && (
          <AddStockUsageModal
            onClose={handleCloseModals}
            onAdd={handleModalSuccess}
          />
        )}

        {viewingUsage && (
          <ViewStockUsageModal
            usage={viewingUsage}
            onClose={handleCloseModals}
          />
        )}
      </AnimatePresence>
    </div>
  )
}