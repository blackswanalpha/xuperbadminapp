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
    Calendar,
    FileText,
    Wrench,
    Package
} from 'lucide-react'
import { fetchJobCard, JobCard } from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import { designTokens } from '@/lib/theme/design-tokens'

// Tab Button Component
const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
    >
        <Icon size={16} />
        {label}
    </button>
)

export default function JobCardDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [jobCard, setJobCard] = useState<JobCard | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!jobCard) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900">Job Card Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Go Back
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
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="text-gray-500" size={20} />
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
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">
                        <Printer size={16} />
                        Print
                    </button>
                    <button
                        onClick={() => router.push(`/supervisor/garage/job-cards/${id}/edit`)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                        <Trash size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Job Value"
                    value={`KES ${(jobCard.total_job_value || 0).toLocaleString()}`}
                    icon={Banknote}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Balance Due"
                    value={`KES ${(jobCard.balance_due || 0).toLocaleString()}`}
                    icon={Calculator}
                    color={jobCard.balance_due > 0 ? '#ef4444' : '#22c55e'}
                />
                <StatCard
                    title="Estimated Cost"
                    value={`KES ${(jobCard.estimated_cost || 0).toLocaleString()}`}
                    icon={Banknote}
                    color="#f59e0b" // Amber-500
                />
                <StatCard
                    title="Duration"
                    value={`${durationDays} Days`}
                    icon={Clock}
                    color="#6366f1" // Indigo-500
                />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 flex gap-4">
                <TabButton
                    active={activeTab === 'overview'}
                    label="Overview"
                    icon={FileText}
                    onClick={() => setActiveTab('overview')}
                />
                <TabButton
                    active={activeTab === 'workflow'}
                    label="Services"
                    icon={Wrench}
                    onClick={() => setActiveTab('workflow')}
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
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <User size={24} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{jobCard.client_name}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{jobCard.client_email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium text-gray-900">{jobCard.client_phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Vehicle Information">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <Car size={24} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Registration</p>
                                        <p className="font-medium text-gray-900">{jobCard.registration_number}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Make/Model</p>
                                        <p className="font-medium text-gray-900">{jobCard.make || 'N/A'} {jobCard.model}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Mileage</p>
                                        <p className="font-medium text-gray-900">{jobCard.speedometer_reading?.toLocaleString() || 'N/A'} km</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Fuel Level</p>
                                        <p className="font-medium text-gray-900">{jobCard.fuel_tank_level || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'workflow' && (
                    <motion.div
                        key="workflow"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <DashboardCard title="Authorized Services" subtitle="Maintenance tasks for this job">
                            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
                            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
                            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
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
