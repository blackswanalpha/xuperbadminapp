'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import PartsList from './parts-list'
import AddPartModal from './add-part-modal'
import EditPartModal from './edit-part-modal'
import StockAdjustmentModal from './stock-adjustment-modal'
import { Part } from '@/types/inventory-api'

export default function PartsTab() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [adjustingPart, setAdjustingPart] = useState<Part | null>(null)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAddPart = () => {
    setShowAddModal(true)
  }

  const handleEditPart = (part: Part) => {
    setEditingPart(part)
  }

  const handleStockAdjustment = (part: Part) => {
    setAdjustingPart(part)
  }

  const handleCloseModals = () => {
    setShowAddModal(false)
    setEditingPart(null)
    setAdjustingPart(null)
  }

  const handleModalSuccess = () => {
    handleRefresh()
    handleCloseModals()
  }

  return (
    <div className="space-y-6">
      <PartsList
        onEdit={handleEditPart}
        onAdd={handleAddPart}
        onStockAdjustment={handleStockAdjustment}
        refreshTrigger={refreshTrigger}
      />

      <AnimatePresence>
        {showAddModal && (
          <AddPartModal
            onClose={handleCloseModals}
            onAdd={handleModalSuccess}
          />
        )}

        {editingPart && (
          <EditPartModal
            partId={editingPart.id}
            onClose={handleCloseModals}
            onUpdate={handleModalSuccess}
          />
        )}

        {adjustingPart && (
          <StockAdjustmentModal
            part={adjustingPart}
            onClose={handleCloseModals}
            onAdjust={handleModalSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}