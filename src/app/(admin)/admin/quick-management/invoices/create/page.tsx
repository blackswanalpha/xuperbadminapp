'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { colors } from '@/lib/theme/colors'
import { createInvoice, fetchContractsForSelect, Contract } from '@/lib/api'

export default function CreateInvoicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracts] = useState(true)

  const [formData, setFormData] = useState({
    contract: '',
    type: 'RENTAL',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => {
    const loadContracts = async () => {
      try {
        const data = await fetchContractsForSelect()
        setContracts(data)
      } catch (err) {
        console.error('Failed to load contracts:', err)
        setError('Failed to load contracts. Please try refreshing.')
      } finally {
        setIsLoadingContracts(false)
      }
    }
    loadContracts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.contract) throw new Error('Please select a contract')

      const payload = {
        contract: formData.contract,
        amount: parseFloat(formData.amount),
        type: formData.type,
        due_date: formData.due_date,
        description: formData.description,
        client: contracts.find(c => c.id.toString() === formData.contract)?.client.id
      }

      await createInvoice(payload)
      router.push('/admin/quick-management?tab=invoices')
    } catch (err: any) {
      console.error('Error creating invoice:', err)
      setError(err.message || 'Failed to create invoice. Please try again.')
      setIsLoading(false)
    }
  }

  const invoiceTypes = [
    { value: 'RENTAL', label: 'Rental' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'PENALTY', label: 'Penalty' },
    { value: 'EXTENSION', 'label': 'Extension' },
    { value: 'DAMAGE', 'label': 'Damage' },
    { value: 'LATE_FEE', 'label': 'Late Fee' },
  ]

  return (
    <div className="max-w-3xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: colors.textSecondary }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Create New Invoice
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Generate a new invoice for a contract
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6" style={{ borderColor: colors.borderLight }}>
          {/* Contract Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Select Contract *
            </label>
            <select
              required
              value={formData.contract}
              onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: colors.borderLight }}
              disabled={isLoadingContracts}
            >
              <option value="">{isLoadingContracts ? 'Loading contracts...' : 'Select a contract...'}</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.contract_number} - {contract.client_name} ({contract.vehicle_make} {contract.vehicle_model})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Invoice Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
              >
                {invoiceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Amount (KSh) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  KSh
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-11 pl-14 pr-4 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: colors.borderLight }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
              style={{ borderColor: colors.borderLight }}
              placeholder="Enter invoice details..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t" style={{ borderColor: colors.borderLight }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors hover:bg-gray-100"
              style={{ color: colors.textSecondary }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isLoadingContracts}
              className="px-6 py-2.5 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              style={{ backgroundColor: colors.adminPrimary, opacity: isLoading ? 0.7 : 1 }}
            >
              <Save size={18} />
              {isLoading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
