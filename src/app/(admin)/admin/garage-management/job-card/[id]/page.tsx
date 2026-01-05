'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft,
    Printer,
    Edit,
    Trash,
    Banknote,
    Clock,
    Calculator,
    Car,
    User,
    FileText,
    Wrench,
    Package,
    X
} from 'lucide-react'
import { fetchJobCard, deleteJobCard, JobCard } from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

// Tab Button Component
const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active
            ? 'text-white'
            : 'border-transparent hover:border-gray-300'
            }`}
        style={{
            borderBottomColor: active ? colors.adminPrimary : 'transparent',
            color: active ? colors.adminPrimary : colors.textSecondary
        }}
    >
        <Icon size={16} />
        {label}
    </button>
)

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobCardNumber }: any) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                            Delete Job Card
                        </h3>
                        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                            This action cannot be undone
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={20} style={{ color: colors.textSecondary }} />
                    </button>
                </div>

                <p className="mb-6" style={{ color: colors.textSecondary }}>
                    Are you sure you want to delete job card <span className="font-semibold">{jobCardNumber}</span>?
                    All associated data will be permanently removed.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: colors.adminError }}
                    >
                        Delete Job Card
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default function JobCardDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [jobCard, setJobCard] = useState<JobCard | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const result = await fetchJobCard(Number(id))
                setJobCard(result)
            } catch (error) {
                console.error('Error loading job card:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleDelete = async () => {
        if (!id) return
        setDeleting(true)
        try {
            await deleteJobCard(Number(id))
            router.push('/admin/garage-management')
        } catch (error) {
            console.error('Error deleting job card:', error)
            alert('Failed to delete job card. Please try again.')
        } finally {
            setDeleting(false)
            setShowDeleteModal(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.adminPrimary }}></div>
            </div>
        )
    }

    if (!jobCard) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>Job Card Not Found</h2>
                <button
                    onClick={() => router.push('/admin/garage-management')}
                    className="mt-4 hover:underline"
                    style={{ color: colors.adminPrimary }}
                >
                    Back to Garage Management
                </button>
            </div>
        )
    }

    const durationDays = Math.ceil(
        (new Date().getTime() - new Date(jobCard.date_created).getTime()) / (1000 * 3600 * 24)
    )

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'in_progress': return 'bg-blue-100 text-blue-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'on_hold': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                jobCardNumber={jobCard.job_card_number}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin/garage-management')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft style={{ color: colors.textSecondary }} size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                                {jobCard.job_card_number}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(jobCard.status)}`}>
                                {jobCard.status}
                            </span>
                        </div>
                        <p style={{ color: colors.textSecondary }} className="flex items-center gap-2">
                            {jobCard.client_name} • {jobCard.registration_number}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
                    >
                        <Printer size={16} />
                        Print
                    </button>
                    <button
                        onClick={() => router.push(`/admin/garage-management/job-card/${id}/edit`)}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        style={{
                            borderColor: colors.adminError + '40',
                            color: colors.adminError,
                            opacity: deleting ? 0.5 : 1
                        }}
                    >
                        <Trash size={16} />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Job Value"
                    value={`KES ${(jobCard.total_job_value || 0).toLocaleString()}`}
                    icon={Banknote}
                    color={colors.adminPrimary}
                />
                <StatCard
                    title="Balance Due"
                    value={`KES ${(jobCard.balance_due || 0).toLocaleString()}`}
                    icon={Calculator}
                    color={jobCard.balance_due > 0 ? colors.adminError : colors.adminSuccess}
                />
                <StatCard
                    title="Estimated Cost"
                    value={`KES ${(jobCard.estimated_cost || 0).toLocaleString()}`}
                    icon={Banknote}
                    color={colors.adminWarning}
                />
                <StatCard
                    title="Duration"
                    value={`${durationDays} Days`}
                    icon={Clock}
                    color={colors.adminAccent}
                />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b flex gap-4" style={{ borderColor: colors.borderLight }}>
                <TabButton
                    active={activeTab === 'overview'}
                    label="Overview"
                    icon={FileText}
                    onClick={() => setActiveTab('overview')}
                />
                <TabButton
                    active={activeTab === 'services'}
                    label="Services"
                    icon={Wrench}
                    onClick={() => setActiveTab('services')}
                />
                <TabButton
                    active={activeTab === 'parts'}
                    label="Parts"
                    icon={Package}
                    onClick={() => setActiveTab('parts')}
                />
                <TabButton
                    active={activeTab === 'financials'}
                    label="Financials"
                    icon={Banknote}
                    onClick={() => setActiveTab('financials')}
                />
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <DashboardCard title="Client Information">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}10` }}>
                                        <User size={24} style={{ color: colors.adminPrimary }} />
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Name</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.client_name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Email</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.client_email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Phone</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.client_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Vehicle Information">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}10` }}>
                                        <Car size={24} style={{ color: colors.adminAccent }} />
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Registration</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.registration_number}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Make/Model</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.make || 'N/A'} {jobCard.model}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Mileage</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.speedometer_reading?.toLocaleString() || 'N/A'} km</p>
                                    </div>
                                    <div>
                                        <p className="text-sm" style={{ color: colors.textSecondary }}>Fuel Level</p>
                                        <p className="font-medium" style={{ color: colors.textPrimary }}>{jobCard.fuel_tank_level || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'services' && (
                    <motion.div
                        key="services"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <DashboardCard title="Authorized Services" subtitle="Maintenance tasks for this job">
                            <div className="py-8 text-center rounded-lg border border-dashed"
                                style={{
                                    backgroundColor: `${colors.adminPrimary}05`,
                                    borderColor: colors.borderLight,
                                    color: colors.textSecondary
                                }}
                            >
                                <Wrench className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No service breakdown data available yet.</p>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'parts' && (
                    <motion.div
                        key="parts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <DashboardCard title="Parts Used" subtitle="Inventory items allocated to this job">
                            <div className="py-8 text-center rounded-lg border border-dashed"
                                style={{
                                    backgroundColor: `${colors.adminAccent}05`,
                                    borderColor: colors.borderLight,
                                    color: colors.textSecondary
                                }}
                            >
                                <Package className="mx-auto mb-2 opacity-50" size={32} />
                                <p>No parts allocation data available yet.</p>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'financials' && (
                    <motion.div
                        key="financials"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <DashboardCard title="Financial Overview" subtitle="Payments and invoicing">
                            <div className="py-8 text-center rounded-lg border border-dashed"
                                style={{
                                    backgroundColor: `${colors.adminSuccess}05`,
                                    borderColor: colors.borderLight,
                                    color: colors.textSecondary
                                }}
                            >
                                <Banknote className="mx-auto mb-2 opacity-50" size={32} />
                                <p>Financial breakdown data coming soon.</p>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
