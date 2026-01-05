'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, HelpCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { colors } from '@/lib/theme/colors'
import { createVehicleExpense, fetchVehiclesForSelect, Vehicle } from '@/lib/api'

export default function CreateExpensePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)

  const [formData, setFormData] = useState<{
    vehicle_id: string
    category_name: string
    type: 'External' | 'Internal'
    items: { name: string; cost: number }[]
    notes: string
  }>({
    vehicle_id: '',
    category_name: 'Service',
    type: 'External',
    items: [{ name: '', cost: 0 }],
    notes: '',
  })

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await fetchVehiclesForSelect()
        setVehicles(data)
      } catch (err) {
        console.error('Failed to load vehicles:', err)
        setError('Failed to load vehicles. Please try refreshing.')
      } finally {
        setIsLoadingVehicles(false)
      }
    }
    loadVehicles()
  }, [])

  // Calculate total amount from items
  const totalAmount = formData.items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', cost: 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index: number, field: 'name' | 'cost', value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.vehicle_id) throw new Error('Please select a vehicle')
      if (formData.items.length === 0 || !formData.items[0].name) throw new Error('Please add at least one item')

      // Prepare payload for API
      const payload = {
        vehicle_id: formData.vehicle_id,
        category_name: formData.category_name,
        type: formData.type,
        items: formData.items.map(item => item.name),
        item_costs: formData.items.reduce((acc, item) => ({ ...acc, [item.name]: item.cost }), {}),
        total_amount: totalAmount,
        notes: formData.notes
      }

      await createVehicleExpense(payload)
      router.push('/admin/quick-management?tab=expenses')
    } catch (err: any) {
      console.error('Error creating expense:', err)
      setError(err.message || 'Failed to create expense. Please try again.')
      setIsLoading(false)
    }
  }

  const expenseCategories = [
    'Service', 'Bodywork', 'Parts', 'Fuel', 'Insurance', 'Inspection', 'Other'
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
              Create New Expense
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Record a new vehicle expense or maintenance record
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
          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Select Vehicle *
            </label>
            <select
              required
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: colors.borderLight }}
              disabled={isLoadingVehicles}
            >
              <option value="">{isLoadingVehicles ? 'Loading vehicles...' : 'Select a vehicle...'}</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Category *
              </label>
              <select
                required
                value={formData.category_name}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                Expense Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="External"
                    checked={formData.type === 'External'}
                    onChange={() => setFormData({ ...formData, type: 'External' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>External (Vendor)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="Internal"
                    checked={formData.type === 'Internal'}
                    onChange={() => setFormData({ ...formData, type: 'Internal' })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Internal (Garage)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                Expense Items *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm font-medium flex items-center gap-1 hover:underline"
                style={{ color: colors.adminPrimary }}
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {formData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 items-start"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Item description (e.g. Brake Pads)"
                        className="w-full h-10 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                      />
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.cost || ''}
                        onChange={(e) => handleItemChange(index, 'cost', parseFloat(e.target.value) || 0)}
                        placeholder="Cost"
                        className="w-full h-10 px-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="flex justify-end pt-4 border-t" style={{ borderColor: colors.borderLight }}>
            <div className="text-right">
              <span className="text-sm text-gray-500 block mb-1">Total Estimated Cost</span>
              <span className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>
                KSh {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
              Notes / Remarks
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
              style={{ borderColor: colors.borderLight }}
              placeholder="Any additional information..."
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
              disabled={isLoading || isLoadingVehicles}
              className="px-6 py-2.5 rounded-lg text-white font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              style={{ backgroundColor: colors.adminSuccess, opacity: isLoading ? 0.7 : 1 }}
            >
              <Save size={18} />
              {isLoading ? 'Creating Expense...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
