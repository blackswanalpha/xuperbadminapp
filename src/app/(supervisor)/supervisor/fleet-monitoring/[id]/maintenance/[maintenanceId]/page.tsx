'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft,
    Edit,
    Wrench,
    Calendar,
    DollarSign,
    FileText,
    Car,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    Save,
    X
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import api from '@/lib/axios'

export default function MaintenanceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const vehicleId = params.id as string
    const maintenanceId = params.maintenanceId as string

    const [loading, setLoading] = useState(true)
    const [maintenance, setMaintenance] = useState<any>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [newStatus, setNewStatus] = useState('')

    useEffect(() => {
        loadMaintenanceData()
    }, [maintenanceId])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showStatusDropdown) {
                const target = event.target as Element
                if (!target.closest('.status-dropdown-container')) {
                    setShowStatusDropdown(false)
                    setNewStatus('')
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showStatusDropdown])

    const loadMaintenanceData = async () => {
        try {
            setLoading(true)
            const response = await api.get(`maintenance/${maintenanceId}/`)
            setMaintenance(response.data)
        } catch (error: any) {
            console.error('Error loading maintenance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateMaintenanceStatus = async (status: string) => {
        try {
            setIsUpdatingStatus(true)
            const updateData: any = {
                status: status
            }

            // If marking as completed, set completion date
            if (status === 'completed') {
                updateData.completed_date = new Date().toISOString()
            }

            const response = await api.patch(
                `maintenance/${maintenanceId}/`,
                updateData
            )

            setMaintenance(response.data)
            setShowStatusDropdown(false)
            setNewStatus('')

        } catch (error: any) {
            console.error('Error updating maintenance status:', error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
        { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    ]

    const handleStatusChange = (status: string) => {
        if (status !== maintenance.status) {
            setNewStatus(status)
        }
    }

    const confirmStatusUpdate = () => {
        if (newStatus && newStatus !== maintenance.status) {
            updateMaintenanceStatus(newStatus)
        }
    }

    const cancelStatusUpdate = () => {
        setShowStatusDropdown(false)
        setNewStatus('')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!maintenance) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Maintenance record not found</p>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'scheduled': return 'bg-yellow-100 text-yellow-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return CheckCircle
            case 'in_progress': return Clock
            case 'scheduled': return Calendar
            case 'cancelled': return AlertCircle
            default: return Clock
        }
    }

    const StatusIcon = getStatusIcon(maintenance.status)

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
                        onClick={() => router.push(`/supervisor/fleet-monitoring/${vehicleId}?tab=maintenance`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            Maintenance Details
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            {maintenance.maintenance_type.replace('_', ' ').toUpperCase()} - Vehicle #{vehicleId}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Status Display/Update */}
                    <div className="relative status-dropdown-container">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            disabled={isUpdatingStatus}
                            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors hover:shadow-md ${getStatusColor(maintenance.status)} ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <StatusIcon size={16} />
                            {maintenance.status.replace('_', ' ').toUpperCase()}
                            <ChevronDown size={14} className={`transform transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Status Dropdown */}
                        <AnimatePresence>
                            {showStatusDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                >
                                    <div className="p-4">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Update Maintenance Status</h4>
                                        <div className="space-y-2">
                                            {statusOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleStatusChange(option.value)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${newStatus === option.value
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : maintenance.status === option.value
                                                                ? 'border-gray-300 bg-gray-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex-1 text-left">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${option.color}`}>
                                                            {option.label}
                                                        </span>
                                                        {maintenance.status === option.value && (
                                                            <span className="text-xs text-gray-500 block mt-1">Current status</span>
                                                        )}
                                                        {newStatus === option.value && newStatus !== maintenance.status && (
                                                            <span className="text-xs text-blue-600 block mt-1">Selected for update</span>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        {newStatus && newStatus !== maintenance.status && (
                                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                                                <button
                                                    onClick={cancelStatusUpdate}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                >
                                                    <X size={16} />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={confirmStatusUpdate}
                                                    disabled={isUpdatingStatus}
                                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {isUpdatingStatus ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={16} />
                                                            Update
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <DashboardCard title="Maintenance Information" subtitle="Basic details">
                        <div className="space-y-4">
                            <InfoRow
                                label="Maintenance Type"
                                value={maintenance.maintenance_type.replace('_', ' ').toUpperCase()}
                                icon={Wrench}
                            />
                            <InfoRow
                                label="Description"
                                value={maintenance.description}
                                icon={FileText}
                            />
                            <InfoRow
                                label="Cost"
                                value={`KES ${parseFloat(maintenance.cost).toLocaleString()}`}
                                icon={DollarSign}
                            />
                        </div>
                    </DashboardCard>

                    {/* Dates */}
                    <DashboardCard title="Schedule & Timeline" subtitle="Important dates">
                        <div className="space-y-4">
                            <InfoRow
                                label="Scheduled Date"
                                value={new Date(maintenance.scheduled_date).toLocaleString()}
                                icon={Calendar}
                            />
                            {maintenance.completed_date && (
                                <InfoRow
                                    label="Completed Date"
                                    value={new Date(maintenance.completed_date).toLocaleString()}
                                    icon={CheckCircle}
                                />
                            )}
                            {maintenance.insurance_expiry && (
                                <InfoRow
                                    label="Insurance Expiry"
                                    value={new Date(maintenance.insurance_expiry).toLocaleDateString()}
                                    icon={Calendar}
                                />
                            )}
                            {maintenance.next_maintenance_date && (
                                <InfoRow
                                    label="Next Maintenance Date"
                                    value={new Date(maintenance.next_maintenance_date).toLocaleDateString()}
                                    icon={Calendar}
                                />
                            )}
                            {maintenance.is_overdue && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                    <AlertCircle size={20} className="text-red-600" />
                                    <span className="text-sm font-medium text-red-800">This maintenance is overdue</span>
                                </div>
                            )}
                        </div>
                    </DashboardCard>

                    {/* Notes */}
                    {maintenance.notes && (
                        <DashboardCard title="Additional Notes" subtitle="Extra information">
                            <div className="text-gray-700 whitespace-pre-wrap">
                                {maintenance.notes}
                            </div>
                        </DashboardCard>
                    )}
                </div>

                {/* Right Column - Related Info */}
                <div className="space-y-6">
                    {/* Vehicle Information */}
                    <DashboardCard title="Vehicle" subtitle="Associated vehicle">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: colors.supervisorPrimaryLight }}
                                >
                                    <Car size={20} style={{ color: colors.supervisorPrimary }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {maintenance.vehicle_registration || `Vehicle #${maintenance.vehicle}`}
                                    </p>
                                    <Link
                                        href={`/supervisor/fleet-monitoring/${vehicleId}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Vehicle Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    {/* Supervisor Information */}
                    {maintenance.supervisor_id && (
                        <DashboardCard title="Supervisor" subtitle="Assigned supervisor">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: colors.supervisorAccent + '20' }}
                                    >
                                        <User size={20} style={{ color: colors.supervisorAccent }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Supervisor #{maintenance.supervisor_id}</p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    )}

                    {/* Metadata */}
                    <DashboardCard title="Record Details" subtitle="Tracking information">
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Created At</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(maintenance.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Last Updated</p>
                                <p className="font-medium text-gray-800">
                                    {new Date(maintenance.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </motion.div>
    )
}

// Helper Components
function InfoRow({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={16} className="text-gray-400 mt-0.5" />}
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <span className="text-sm text-gray-800 text-right max-w-md">{value}</span>
        </div>
    )
}
