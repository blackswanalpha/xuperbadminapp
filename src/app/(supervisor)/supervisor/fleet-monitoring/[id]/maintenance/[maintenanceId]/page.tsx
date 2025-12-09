'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
    AlertCircle
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function MaintenanceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const vehicleId = params.id as string
    const maintenanceId = params.maintenanceId as string

    const [loading, setLoading] = useState(true)
    const [maintenance, setMaintenance] = useState<any>(null)

    useEffect(() => {
        loadMaintenanceData()
    }, [maintenanceId])

    const loadMaintenanceData = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('access_token')
            const response = await axios.get(`${API_BASE_URL}/maintenance/${maintenanceId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setMaintenance(response.data)
        } catch (error) {
            console.error('Error loading maintenance data:', error)
        } finally {
            setLoading(false)
        }
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
                    <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(maintenance.status)}`}>
                        <StatusIcon size={16} />
                        {maintenance.status.replace('_', ' ').toUpperCase()}
                    </span>
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
