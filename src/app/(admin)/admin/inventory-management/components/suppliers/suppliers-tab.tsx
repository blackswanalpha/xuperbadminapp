'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import SuppliersList from './suppliers-list'
import AddSupplierModal from './add-supplier-modal'
import EditSupplierModal from './edit-supplier-modal'
import ViewSupplierModal from './view-supplier-modal'
import { InventorySupplier } from '@/types/inventory-api'

export default function SuppliersTab() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<InventorySupplier | null>(null)
  const [viewingSupplier, setViewingSupplier] = useState<InventorySupplier | null>(null)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAddSupplier = () => {
    setShowAddModal(true)
  }

  const handleEditSupplier = (supplier: InventorySupplier) => {
    setEditingSupplier(supplier)
  }

  const handleViewSupplier = (supplier: InventorySupplier) => {
    setViewingSupplier(supplier)
  }

  const handleCloseModals = () => {
    setShowAddModal(false)
    setEditingSupplier(null)
    setViewingSupplier(null)
  }

  const handleModalSuccess = () => {
    handleRefresh()
    handleCloseModals()
  }

  return (
    <div className="space-y-6">
      <SuppliersList
        onAdd={handleAddSupplier}
        onEdit={handleEditSupplier}
        onView={handleViewSupplier}
        refreshTrigger={refreshTrigger}
      />

      <AnimatePresence>
        {showAddModal && (
          <AddSupplierModal
            onClose={handleCloseModals}
            onAdd={handleModalSuccess}
          />
        )}

        {editingSupplier && (
          <EditSupplierModal
            supplierId={editingSupplier.id}
            onClose={handleCloseModals}
            onUpdate={handleModalSuccess}
          />
        )}

        {viewingSupplier && (
          <ViewSupplierModal
            supplier={viewingSupplier}
            onClose={handleCloseModals}
          />
        )}
      </AnimatePresence>
    </div>
  )
}