'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    Trash2,
    AlertCircle
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
    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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
            setError(null)
            const data = await fetchInventoryItem(parseInt(vehicleId))
            console.log('Loaded inventory data:', data)
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
        } catch (error: any) {
            console.error('Error loading inventory data:', error)
            const errorMessage = error?.response?.data?.detail || 
                                error?.response?.data?.message ||
                                error?.message || 
                                'Failed to load vehicle data'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const validateForm = () => {
        const errors: Record<string, string> = {}
        
        if (!formData.condition) {
            errors.condition = 'Condition is required'
        }
        
        if (!formData.location.trim()) {
            errors.location = 'Location is required'
        }
        
        if (formData.purchase_price && parseFloat(formData.purchase_price) < 0) {
            errors.purchase_price = 'Purchase price cannot be negative'
        }
        
        if (formData.current_value && parseFloat(formData.current_value) < 0) {
            errors.current_value = 'Current value cannot be negative'
        }
        
        if (formData.maintenance_cost && parseFloat(formData.maintenance_cost) < 0) {
            errors.maintenance_cost = 'Maintenance cost cannot be negative'
        }
        
        if (formData.next_inspection && formData.last_inspection) {
            const nextDate = new Date(formData.next_inspection)
            const lastDate = new Date(formData.last_inspection)
            if (nextDate <= lastDate) {
                errors.next_inspection = 'Next inspection must be after last inspection'
            }
        }
        
        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            setError('Please fix the errors below before submitting')
            return
        }
        
        try {
            setSaving(true)
            setError(null)
            setFieldErrors({})
            
            // Prepare data for API - only send fields that are allowed to be updated
            const updateData: any = {
                condition: formData.condition as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
                location: formData.location.trim()
            }
            
            // Only include optional fields if they have values
            if (formData.last_inspection) {
                updateData.last_inspection = formData.last_inspection
            }
            if (formData.next_inspection) {
                updateData.next_inspection = formData.next_inspection
            }
            if (formData.purchase_date) {
                updateData.purchase_date = formData.purchase_date
            }
            if (formData.purchase_price && formData.purchase_price.trim() !== '') {
                const price = parseFloat(formData.purchase_price)
                if (!isNaN(price)) {
                    updateData.purchase_price = price.toString()
                }
            }
            if (formData.current_value && formData.current_value.trim() !== '') {
                const value = parseFloat(formData.current_value)
                if (!isNaN(value)) {
                    updateData.current_value = value.toString()
                }
            }
            if (formData.maintenance_cost && formData.maintenance_cost.trim() !== '') {
                const cost = parseFloat(formData.maintenance_cost)
                if (!isNaN(cost)) {
                    updateData.maintenance_cost = cost.toString()
                }
            }
            
            console.log('Sending update data:', updateData)
            
            await updateInventoryItem(parseInt(vehicleId), updateData)
            
            router.push(`/supervisor/fleet-monitoring/${vehicleId}`)
        } catch (error: any) {
            console.error('Error updating inventory:', error)
            
            // Handle specific API errors
            if (error?.response?.status === 400) {
                const errorData = error.response.data
                if (typeof errorData === 'object') {
                    // Handle field-specific errors
                    const newFieldErrors: Record<string, string> = {}
                    Object.keys(errorData).forEach(field => {
                        if (Array.isArray(errorData[field])) {
                            newFieldErrors[field] = errorData[field][0]
                        } else {
                            newFieldErrors[field] = errorData[field]
                        }
                    })
                    setFieldErrors(newFieldErrors)
                    setError('Please fix the validation errors below')
                } else {
                    setError('Invalid data provided. Please check your inputs.')
                }
            } else if (error?.response?.status === 401) {
                setError('You are not authorized to perform this action. Please log in again.')
            } else if (error?.response?.status === 404) {
                setError('Vehicle not found. It may have been deleted.')
            } else {
                const errorMessage = error?.response?.data?.detail || 
                                    error?.response?.data?.message ||
                                    error?.message || 
                                    'Failed to update vehicle. Please try again.'
                setError(errorMessage)
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this inventory record? This action cannot be undone.')) {
            return
        }

        try {
            setError(null)
            await deleteInventoryItem(parseInt(vehicleId))
            router.push('/supervisor/fleet-monitoring')
        } catch (error: any) {
            console.error('Error deleting inventory:', error)
            const errorMessage = error?.response?.data?.detail || 
                                error?.response?.data?.message ||
                                error?.message || 
                                'Failed to delete vehicle. Please try again.'
            setError(errorMessage)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vehicle data...</p>
                </div>
            </div>
        )
    }

    if (error && !formData.condition) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-medium">Error Loading Vehicle</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={loadInventoryData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
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

            {/* Error Alert */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-medium">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Condition & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition *
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => {
                                    setFormData({ ...formData, condition: e.target.value })
                                    if (fieldErrors.condition) {
                                        setFieldErrors(prev => ({ ...prev, condition: '' }))
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    fieldErrors.condition 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                required
                            >
                                <option value="">Select condition</option>
                                <option value="EXCELLENT">Excellent</option>
                                <option value="GOOD">Good</option>
                                <option value="FAIR">Fair</option>
                                <option value="POOR">Poor</option>
                            </select>
                            {fieldErrors.condition && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.condition}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => {
                                    setFormData({ ...formData, location: e.target.value })
                                    if (fieldErrors.location) {
                                        setFieldErrors(prev => ({ ...prev, location: '' }))
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    fieldErrors.location 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="Current location"
                                required
                            />
                            {fieldErrors.location && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.location}</p>
                            )}
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
                                onChange={(e) => {
                                    setFormData({ ...formData, next_inspection: e.target.value })
                                    if (fieldErrors.next_inspection) {
                                        setFieldErrors(prev => ({ ...prev, next_inspection: '' }))
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    fieldErrors.next_inspection 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            />
                            {fieldErrors.next_inspection && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.next_inspection}</p>
                            )}
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
                                min="0"
                                value={formData.purchase_price}
                                onChange={(e) => {
                                    setFormData({ ...formData, purchase_price: e.target.value })
                                    if (fieldErrors.purchase_price) {
                                        setFieldErrors(prev => ({ ...prev, purchase_price: '' }))
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    fieldErrors.purchase_price 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="0.00"
                            />
                            {fieldErrors.purchase_price && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.purchase_price}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Value (KES)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.current_value}
                                onChange={(e) => {
                                    setFormData({ ...formData, current_value: e.target.value })
                                    if (fieldErrors.current_value) {
                                        setFieldErrors(prev => ({ ...prev, current_value: '' }))
                                    }
                                }}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                    fieldErrors.current_value 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500'
                                }`}
                                placeholder="0.00"
                            />
                            {fieldErrors.current_value && (
                                <p className="text-red-600 text-sm mt-1">{fieldErrors.current_value}</p>
                            )}
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
                            min="0"
                            value={formData.maintenance_cost}
                            onChange={(e) => {
                                setFormData({ ...formData, maintenance_cost: e.target.value })
                                if (fieldErrors.maintenance_cost) {
                                    setFieldErrors(prev => ({ ...prev, maintenance_cost: '' }))
                                }
                            }}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                fieldErrors.maintenance_cost 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="0.00"
                        />
                        {fieldErrors.maintenance_cost && (
                            <p className="text-red-600 text-sm mt-1">{fieldErrors.maintenance_cost}</p>
                        )}
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
