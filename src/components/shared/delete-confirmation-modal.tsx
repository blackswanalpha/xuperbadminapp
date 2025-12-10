'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { colors } from '@/lib/theme/colors'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemDetails?: {
    label: string
    value: string
  }[]
  isDeleting?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemDetails,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      if (confirm('Are you sure you want to cancel the deletion?')) {
        onClose()
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.borderLight }}>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.adminError}20` }}
                >
                  <AlertTriangle size={24} style={{ color: colors.adminError }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X size={20} style={{ color: colors.textSecondary }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="mb-4" style={{ color: colors.textSecondary }}>
                {message}
              </p>

              {itemDetails && itemDetails.length > 0 && (
                <div className="mb-4 p-4 rounded-lg bg-gray-50">
                  {itemDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                      style={{
                        borderBottom:
                          index < itemDetails.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                        {detail.label}:
                      </span>
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="p-4 rounded-lg border-l-4 mb-4"
                style={{
                  backgroundColor: `${colors.adminWarning}10`,
                  borderColor: colors.adminWarning,
                }}
              >
                <p className="text-sm font-medium" style={{ color: colors.adminWarning }}>
                  ⚠️ Warning: This action cannot be undone!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: colors.borderLight }}>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-lg border font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                style={{ borderColor: colors.borderMedium, color: colors.textSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: colors.adminError }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

