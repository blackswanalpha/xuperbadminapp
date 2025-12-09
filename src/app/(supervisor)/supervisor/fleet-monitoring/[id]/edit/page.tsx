'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Trash2
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
    fetchInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    InventoryItem
} from '@/lib/api'

export default function FleetEditPage() {
    const params = useParams()
    const router = useRouter()
    const vehicleId = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<{
        condition: string
        location: string
        last_inspection: string
        next_inspection: string
        purchase_date: string
        purchase_price: string
        current_value: string
        maintenance_cost: string
    }>({
        condition: '',
        location: '',
        last_inspection: '',
        next_inspection: '',
        purchase_date: '',
        purchase_price: '',
        current_value: '',
        maintenance_cost: ''
    })

    useEffect(() => {
        loadInventoryData()
    }, [vehicleId])

    const loadInventoryData = async () => {
        try {
            setLoading(true)
            const data = await fetchInventoryItem(parseInt(vehicleId))
            setFormData({
                condition: data.condition || '',
                location: data.location || '',
                last_inspection: data.last_inspection || '',
                next_inspection: data.next_inspection || '',
                purchase_date: data.purchase_date || '',
                purchase_price: data.purchase_price?.toString() || '',
                current_value: data.current_value?.toString() || '',
                maintenance_cost: data.maintenance_cost?.toString() || ''
            })
        } catch (error) {
            console.error('Error loading inventory data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            await updateInventoryItem(parseInt(vehicleId), {
                ...formData,
                condition: formData.condition as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
            })
            router.push(`/supervisor/fleet-monitoring/${vehicleId}`)
        } catch (error) {
            console.error('Error updating inventory:', error)
            alert('Failed to update inventory. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this inventory record? This action cannot be undone.')) {
            return
        }

        try {
            await deleteInventoryItem(parseInt(vehicleId))
            router.push('/supervisor/fleet-monitoring')
        } catch (error) {
            console.error('Error deleting inventory:', error)
            alert('Failed to delete inventory. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            Edit Fleet Vehicle
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            Update inventory details
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                    <Trash2 size={20} />
                    Delete
                </button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Condition & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select condition</option>
                                <option value="EXCELLENT">Excellent</option>
                                <option value="GOOD">Good</option>
                                <option value="FAIR">Fair</option>
                                <option value="POOR">Poor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Current location"
                                required
                            />
                        </div>
                    </div>

                    {/* Inspection Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Inspection Date
                            </label>
                            <input
                                type="date"
                                value={formData.last_inspection}
                                onChange={(e) => setFormData({ ...formData, last_inspection: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Next Inspection Date
                            </label>
                            <input
                                type="date"
                                value={formData.next_inspection}
                                onChange={(e) => setFormData({ ...formData, next_inspection: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Purchase Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Date
                            </label>
                            <input
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Purchase Price (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.purchase_price}
                                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Value (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.current_value}
                                onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Maintenance Cost */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Total Maintenance Cost (KES)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.maintenance_cost}
                            onChange={(e) => setFormData({ ...formData, maintenance_cost: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Total accumulated maintenance costs for this vehicle
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: colors.supervisorPrimary }}
                        >
                            <Save size={20} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}
