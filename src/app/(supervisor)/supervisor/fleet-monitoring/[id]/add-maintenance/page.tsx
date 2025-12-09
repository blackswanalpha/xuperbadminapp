'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Calendar,
    DollarSign
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { createMaintenanceRecord } from '@/lib/api'

export default function AddMaintenancePage() {
    const params = useParams()
    const router = useRouter()
    const vehicleId = params.id as string

    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        maintenance_type: '',
        description: '',
        cost: '',
        scheduled_date: '',
        completed_date: '',
        status: 'scheduled',
        notes: '',
        insurance_expiry: '',
        next_maintenance_date: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)

            // Prepare data for submission matching MaintenanceCreateSerializer
            const maintenanceData: any = {
                vehicle_id: parseInt(vehicleId),
                maintenance_type: formData.maintenance_type,
                description: formData.description,
                cost: parseFloat(formData.cost),
                scheduled_date: new Date(formData.scheduled_date).toISOString(),
                notes: formData.notes || null,
                insurance_expiry: formData.insurance_expiry ? new Date(formData.insurance_expiry).toISOString() : null,
                next_maintenance_date: formData.next_maintenance_date ? new Date(formData.next_maintenance_date).toISOString() : null
            }

            await createMaintenanceRecord(maintenanceData)
            router.push(`/supervisor/fleet-monitoring/${vehicleId}?tab=maintenance`)
        } catch (error) {
            console.error('Error creating maintenance record:', error)
            alert('Failed to create maintenance record. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Add Maintenance Record
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Create a new maintenance record for Vehicle #{vehicleId}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Maintenance Type & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maintenance Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.maintenance_type}
                                onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select type</option>
                                <option value="routine">Routine Service</option>
                                <option value="repair">Repair</option>
                                <option value="inspection">Inspection</option>
                                <option value="insurance">Insurance Renewal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the maintenance work..."
                            required
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline mr-2" size={16} />
                                Scheduled Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduled_date}
                                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline mr-2" size={16} />
                                Completed Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.completed_date}
                                onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Cost */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <DollarSign className="inline mr-2" size={16} />
                            Cost (KES) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Optional Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Insurance Expiry Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.insurance_expiry}
                                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                For insurance renewal maintenance
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Next Maintenance Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.next_maintenance_date}
                                onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Any additional information..."
                        />
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
                            {saving ? 'Creating...' : 'Create Maintenance Record'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}
