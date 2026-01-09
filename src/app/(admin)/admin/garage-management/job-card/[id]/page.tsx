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
    X,
    Check,
    AlertTriangle,
    ClipboardCheck,
    Phone,
    Mail,
    Calendar,
    Gauge,
    Fuel,
    Hash
} from 'lucide-react'
import { fetchJobCard, deleteJobCard, JobCard } from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'

// Tab Button Component
const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors`}
        style={{
            borderBottomColor: active ? colors.adminPrimary : 'transparent',
            color: active ? colors.adminPrimary : colors.textSecondary
        }}
    >
        <Icon size={16} />
        {label}
    </button>
)

// Info Item Component
const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: any }) => (
    <div className="flex items-start gap-3">
        {Icon && (
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}10` }}>
                <Icon size={16} style={{ color: colors.adminPrimary }} />
            </div>
        )}
        <div>
            <p className="text-sm" style={{ color: colors.textSecondary }}>{label}</p>
            <p className="font-medium" style={{ color: colors.textPrimary }}>{value || 'N/A'}</p>
        </div>
    </div>
)

// Accessory Check Item Component
const AccessoryItem = ({ label, present }: { label: string; present: boolean }) => (
    <div className="flex items-center gap-2">
        {present ? (
            <Check size={16} className="text-green-500" />
        ) : (
            <X size={16} className="text-red-400" />
        )}
        <span className="text-sm" style={{ color: present ? colors.textPrimary : colors.textSecondary }}>
            {label}
        </span>
    </div>
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
    const [jobCard, setJobCard] = useState<any>(null)
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
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700'
            case 'in_progress': return 'bg-blue-100 text-blue-700'
            case 'draft': return 'bg-gray-100 text-gray-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'paid': return 'bg-green-100 text-green-700'
            case 'unpaid': return 'bg-red-100 text-red-700'
            case 'deposit':
            case 'partial': return 'bg-yellow-100 text-yellow-700'
            case 'approved': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'rejected': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return colors.adminError
            case 'high': return '#F97316'
            case 'medium': return colors.adminWarning
            case 'low': return colors.adminSuccess
            default: return colors.textSecondary
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
                            {jobCard.client_name} - {jobCard.make} {jobCard.model} ({jobCard.registration_number})
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

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Payment:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.payment_status)}`}>
                        {jobCard.payment_status}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: colors.textSecondary }}>Approval:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(jobCard.customer_approval_status)}`}>
                        {jobCard.customer_approval_status}
                    </span>
                </div>
                {jobCard.mechanic_status && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: colors.textSecondary }}>Mechanic Status:</span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {jobCard.mechanic_status}
                        </span>
                    </div>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="border-b flex gap-4 overflow-x-auto" style={{ borderColor: colors.borderLight }}>
                <TabButton active={activeTab === 'overview'} label="Overview" icon={FileText} onClick={() => setActiveTab('overview')} />
                <TabButton active={activeTab === 'vehicle'} label="Vehicle" icon={Car} onClick={() => setActiveTab('vehicle')} />
                <TabButton active={activeTab === 'accessories'} label="Accessories" icon={ClipboardCheck} onClick={() => setActiveTab('accessories')} />
                <TabButton active={activeTab === 'services'} label="Services" icon={Wrench} onClick={() => setActiveTab('services')} />
                <TabButton active={activeTab === 'parts'} label="Parts" icon={Package} onClick={() => setActiveTab('parts')} />
                <TabButton active={activeTab === 'financials'} label="Financials" icon={Banknote} onClick={() => setActiveTab('financials')} />
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
                                <InfoItem icon={User} label="Name" value={jobCard.client_name} />
                                <InfoItem icon={Phone} label="Phone" value={jobCard.client_phone} />
                                <InfoItem icon={Mail} label="Email" value={jobCard.client_email} />
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Job Details">
                            <div className="space-y-4">
                                <InfoItem icon={Hash} label="Job Card Number" value={jobCard.job_card_number} />
                                <InfoItem icon={Calendar} label="Date Created" value={new Date(jobCard.date_created).toLocaleString()} />
                                <InfoItem icon={Calendar} label="Date Required" value={jobCard.date_required ? new Date(jobCard.date_required).toLocaleString() : 'N/A'} />
                                <InfoItem icon={Wrench} label="Handled By" value={jobCard.handled_by_mechanic} />
                                {jobCard.order_number && (
                                    <InfoItem icon={Hash} label="Order Number" value={jobCard.order_number} />
                                )}
                            </div>
                        </DashboardCard>

                        {(jobCard.defects || jobCard.repairs) && (
                            <DashboardCard title="Defects & Repairs" className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {jobCard.defects && (
                                        <div>
                                            <h4 className="font-medium mb-2" style={{ color: colors.textPrimary }}>
                                                Car Brought In With Defects
                                            </h4>
                                            <p className="text-sm whitespace-pre-wrap" style={{ color: colors.textSecondary }}>
                                                {jobCard.defects}
                                            </p>
                                        </div>
                                    )}
                                    {jobCard.repairs && (
                                        <div>
                                            <h4 className="font-medium mb-2" style={{ color: colors.textPrimary }}>
                                                Repairs Performed
                                            </h4>
                                            <p className="text-sm whitespace-pre-wrap" style={{ color: colors.textSecondary }}>
                                                {jobCard.repairs}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DashboardCard>
                        )}
                    </motion.div>
                )}

                {activeTab === 'vehicle' && (
                    <motion.div
                        key="vehicle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <DashboardCard title="Vehicle Details">
                            <div className="space-y-4">
                                <InfoItem icon={Car} label="Registration" value={jobCard.registration_number} />
                                <InfoItem label="Make" value={jobCard.make} />
                                <InfoItem label="Model" value={jobCard.model} />
                                <InfoItem icon={Gauge} label="Speedometer" value={`${jobCard.speedometer_reading?.toLocaleString() || 0} km`} />
                                <InfoItem icon={Fuel} label="Fuel Level" value={jobCard.fuel_tank_level} />
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Vehicle Identification">
                            <div className="space-y-4">
                                <InfoItem icon={Hash} label="Chassis Number" value={jobCard.chassis_number} />
                                <InfoItem icon={Hash} label="Engine Number" value={jobCard.engine_number} />
                                <div className="pt-4 border-t space-y-2" style={{ borderColor: colors.borderLight }}>
                                    <div className="flex items-center gap-2">
                                        {jobCard.car_tested_with_customer ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <X size={16} className="text-gray-400" />
                                        )}
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                                            Car tested with customer
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {jobCard.road_test_required ? (
                                            <Check size={16} className="text-green-500" />
                                        ) : (
                                            <X size={16} className="text-gray-400" />
                                        )}
                                        <span className="text-sm" style={{ color: colors.textPrimary }}>
                                            Road test required
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'accessories' && (
                    <motion.div
                        key="accessories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <DashboardCard title="Vehicle Accessories Check" subtitle="Items present in vehicle at check-in">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <AccessoryItem label="Jack" present={jobCard.jack_available} />
                                <AccessoryItem label="Wheel Spanner" present={jobCard.wheel_spanner_available} />
                                <AccessoryItem label="Spare Wheel" present={jobCard.spare_wheel_available} />
                                <AccessoryItem label="Tools" present={jobCard.tools_available} />
                                <AccessoryItem label="Wheel Caps" present={jobCard.wheel_caps_present} />
                                <AccessoryItem label="Radio/Stereo" present={jobCard.radio_stereo_present} />
                                <AccessoryItem label="Door Mirrors" present={jobCard.door_mirrors_present} />
                                <AccessoryItem label="Warning Triangles" present={jobCard.triangles_present} />
                                <AccessoryItem label="First Aid Kit" present={jobCard.first_aid_kit_present} />
                                <AccessoryItem label="CD Changer" present={jobCard.cd_changer_present} />
                                <AccessoryItem label="Floor Mats" present={jobCard.mats_present} />
                                <AccessoryItem label="Cigar Lighter" present={jobCard.cigar_lighter_present} />
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
                        <DashboardCard title="Authorized Services" subtitle="Services agreed with customer">
                            {jobCard.authorized_services?.length > 0 ? (
                                <div className="space-y-3">
                                    {jobCard.authorized_services.map((service: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 rounded-lg border"
                                            style={{ borderColor: colors.borderLight }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {service.approved ? (
                                                    <Check size={16} className="text-green-500" />
                                                ) : (
                                                    <Clock size={16} className="text-yellow-500" />
                                                )}
                                                <span style={{ color: colors.textPrimary }}>{service.description}</span>
                                            </div>
                                            <span className="font-medium" style={{ color: colors.textPrimary }}>
                                                KES {(service.cost || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center rounded-lg border border-dashed"
                                    style={{ backgroundColor: `${colors.adminPrimary}05`, borderColor: colors.borderLight, color: colors.textSecondary }}
                                >
                                    <Wrench className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No authorized services recorded.</p>
                                </div>
                            )}
                        </DashboardCard>

                        <DashboardCard title="Reported Defects" subtitle="Defects noted during check-in">
                            {jobCard.reported_defects?.length > 0 ? (
                                <div className="space-y-3">
                                    {jobCard.reported_defects.map((defect: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 rounded-lg border"
                                            style={{ borderColor: colors.borderLight }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle size={16} style={{ color: getSeverityColor(defect.severity) }} />
                                                <div>
                                                    <span style={{ color: colors.textPrimary }}>{defect.description}</span>
                                                    <span
                                                        className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: `${getSeverityColor(defect.severity)}20`,
                                                            color: getSeverityColor(defect.severity)
                                                        }}
                                                    >
                                                        {defect.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            {defect.resolved ? (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                                    Resolved
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center rounded-lg border border-dashed"
                                    style={{ backgroundColor: `${colors.adminWarning}05`, borderColor: colors.borderLight, color: colors.textSecondary }}
                                >
                                    <AlertTriangle className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No defects reported.</p>
                                </div>
                            )}
                        </DashboardCard>
                    </motion.div>
                )}

                {activeTab === 'parts' && (
                    <motion.div
                        key="parts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <DashboardCard title="Parts Used" subtitle="Inventory items allocated to this job">
                            {jobCard.job_card_parts?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                                                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Part</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>SKU</th>
                                                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Qty</th>
                                                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Unit Price</th>
                                                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobCard.job_card_parts.map((part: any, index: number) => (
                                                <tr key={index} className="border-b" style={{ borderColor: colors.borderLight }}>
                                                    <td className="py-3 px-4" style={{ color: colors.textPrimary }}>{part.part_name}</td>
                                                    <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{part.part_sku}</td>
                                                    <td className="py-3 px-4 text-right" style={{ color: colors.textPrimary }}>{part.quantity}</td>
                                                    <td className="py-3 px-4 text-right" style={{ color: colors.textPrimary }}>KES {(part.unit_price || 0).toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-right font-medium" style={{ color: colors.textPrimary }}>KES {(part.total_cost || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td colSpan={4} className="py-3 px-4 font-semibold text-right" style={{ color: colors.textPrimary }}>Total Parts Cost</td>
                                                <td className="py-3 px-4 text-right font-bold" style={{ color: colors.adminPrimary }}>KES {(jobCard.total_parts_cost || 0).toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center rounded-lg border border-dashed"
                                    style={{ backgroundColor: `${colors.adminAccent}05`, borderColor: colors.borderLight, color: colors.textSecondary }}
                                >
                                    <Package className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No parts allocated to this job yet.</p>
                                </div>
                            )}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DashboardCard title="Cost Summary">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textSecondary }}>Estimated Cost</span>
                                        <span className="font-medium" style={{ color: colors.textPrimary }}>KES {(jobCard.estimated_cost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textSecondary }}>Job Cost</span>
                                        <span className="font-medium" style={{ color: colors.textPrimary }}>KES {(jobCard.job_cost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textSecondary }}>Parts Cost</span>
                                        <span className="font-medium" style={{ color: colors.textPrimary }}>KES {(jobCard.total_parts_cost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t" style={{ borderColor: colors.borderLight }}>
                                        <span className="font-semibold" style={{ color: colors.textPrimary }}>Total Job Value</span>
                                        <span className="font-bold" style={{ color: colors.adminPrimary }}>KES {(jobCard.total_job_value || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </DashboardCard>

                            <DashboardCard title="Payment Status">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textSecondary }}>Total Payments</span>
                                        <span className="font-medium text-green-600">KES {((jobCard.total_job_value || 0) - (jobCard.balance_due || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.textSecondary }}>Balance Due</span>
                                        <span className="font-medium" style={{ color: jobCard.balance_due > 0 ? colors.adminError : colors.adminSuccess }}>
                                            KES {(jobCard.balance_due || 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t" style={{ borderColor: colors.borderLight }}>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobCard.payment_status)}`}>
                                            {jobCard.payment_status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </DashboardCard>

                            <DashboardCard title="Approval Status">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm" style={{ color: colors.textSecondary }}>Customer Approval</span>
                                        <div className="mt-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobCard.customer_approval_status)}`}>
                                                {jobCard.customer_approval_status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </DashboardCard>
                        </div>

                        <DashboardCard title="Payment History" subtitle="Recorded payments for this job">
                            {jobCard.payments?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                                                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Date</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Method</th>
                                                <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Reference</th>
                                                <th className="text-right py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobCard.payments.map((payment: any, index: number) => (
                                                <tr key={index} className="border-b" style={{ borderColor: colors.borderLight }}>
                                                    <td className="py-3 px-4" style={{ color: colors.textPrimary }}>{new Date(payment.payment_date).toLocaleString()}</td>
                                                    <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{payment.payment_method}</td>
                                                    <td className="py-3 px-4" style={{ color: colors.textSecondary }}>{payment.reference_number || '-'}</td>
                                                    <td className="py-3 px-4 text-right font-medium text-green-600">KES {(payment.amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-8 text-center rounded-lg border border-dashed"
                                    style={{ backgroundColor: `${colors.adminSuccess}05`, borderColor: colors.borderLight, color: colors.textSecondary }}
                                >
                                    <Banknote className="mx-auto mb-2 opacity-50" size={32} />
                                    <p>No payments recorded yet.</p>
                                </div>
                            )}
                        </DashboardCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
