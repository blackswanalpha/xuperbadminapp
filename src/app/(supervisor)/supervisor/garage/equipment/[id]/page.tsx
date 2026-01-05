'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchEquipment, Equipment, deleteEquipment } from '@/lib/api'
import { 
    ArrowLeft, 
    Edit, 
    Trash, 
    Settings,
    Calendar,
    DollarSign,
    Activity,
    History,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp,
    Wrench,
    Package,
    BarChart3
} from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

interface MaintenanceRecord {
    id: string
    date: string
    type: 'routine' | 'repair' | 'inspection' | 'replacement'
    description: string
    cost: number
    technician: string
    status: 'completed' | 'pending' | 'in_progress'
}

interface UsageRecord {
    id: string
    date: string
    used_by: string
    purpose: string
    duration: number // in hours
    condition_after: string
}

export default function EquipmentDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const id = params.id as string
    const [equipment, setEquipment] = useState<Equipment | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        isDeleting: false
    })

    // Mock data for demonstration - in a real app, these would come from API calls
    const [maintenanceRecords] = useState<MaintenanceRecord[]>([
        {
            id: '1',
            date: '2024-01-15',
            type: 'routine',
            description: 'Regular maintenance check and calibration',
            cost: 1500,
            technician: 'John Mwangi',
            status: 'completed'
        },
        {
            id: '2',
            date: '2024-02-28',
            type: 'repair',
            description: 'Replaced worn parts and updated firmware',
            cost: 3200,
            technician: 'Sarah Wanjiku',
            status: 'completed'
        },
        {
            id: '3',
            date: '2024-03-10',
            type: 'inspection',
            description: 'Safety inspection and performance assessment',
            cost: 800,
            technician: 'Peter Kiprotich',
            status: 'completed'
        }
    ])

    const [usageRecords] = useState<UsageRecord[]>([
        {
            id: '1',
            date: '2024-01-20',
            used_by: 'Mechanic Team A',
            purpose: 'Engine diagnostics for KBZ 123A',
            duration: 3.5,
            condition_after: 'GOOD'
        },
        {
            id: '2',
            date: '2024-02-05',
            used_by: 'Mechanic Team B',
            purpose: 'Brake system analysis',
            duration: 2.0,
            condition_after: 'EXCELLENT'
        },
        {
            id: '3',
            date: '2024-02-18',
            used_by: 'Supervisor Inspection',
            purpose: 'Quality control check',
            duration: 1.5,
            condition_after: 'GOOD'
        }
    ])

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const result = await fetchEquipment(Number(id))
                setEquipment(result)
            } catch (error) {
                console.error('Error loading equipment data:', error)
                toast({
                    title: "Error",
                    description: "Failed to load equipment data. Please try again.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, toast])

    const handleDeleteClick = () => {
        setDeleteModal({
            isOpen: true,
            isDeleting: false
        })
    }

    const handleDeleteConfirm = async () => {
        if (!equipment) return

        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await deleteEquipment(equipment.id)
            toast({
                title: "Success",
                description: "Equipment deleted successfully",
            })
            router.push('/supervisor/garage/equipment')
        } catch (error: any) {
            console.error('Error deleting equipment:', error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete equipment. Please try again.",
                variant: "destructive"
            })
            setDeleteModal(prev => ({ ...prev, isDeleting: false }))
        }
    }

    const handleDeleteCancel = () => {
        setDeleteModal({
            isOpen: false,
            isDeleting: false
        })
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!equipment) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 space-y-4 p-4 md:p-8 pt-6"
            >
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Equipment Details</h2>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Settings size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Equipment Not Found</h3>
                        <p className="text-gray-500">The equipment you're looking for doesn't exist.</p>
                        <Link href="/supervisor/garage/equipment" className="mt-4 inline-block">
                            <Button variant="outline">Back to Equipment</Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        )
    }

    // Calculate analytics
    const analytics = {
        total_maintenance_cost: maintenanceRecords.reduce((sum, record) => sum + record.cost, 0),
        maintenance_frequency: maintenanceRecords.length,
        total_usage_hours: usageRecords.reduce((sum, record) => sum + record.duration, 0),
        average_usage_per_session: usageRecords.length > 0 ? usageRecords.reduce((sum, record) => sum + record.duration, 0) / usageRecords.length : 0,
        last_maintenance: maintenanceRecords.length > 0 ? maintenanceRecords[maintenanceRecords.length - 1].date : null,
        uptime_percentage: 95, // Mock calculation
        efficiency_rating: 87 // Mock calculation
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6 p-4 md:p-8 pt-6"
        >
            {/* Enhanced Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${colors.supervisorPrimary}15` }}
                    >
                        <Settings size={24} style={{ color: colors.supervisorPrimary }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                            {equipment.name}
                        </h1>
                        <div className="flex items-center gap-2 text-lg" style={{ color: colors.textSecondary }}>
                            {equipment.serial_number && <span>SN: {equipment.serial_number}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                equipment.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                equipment.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                                equipment.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {equipment.status?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                equipment.condition === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                                equipment.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                                equipment.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                            }`}>
                                {equipment.condition} Condition
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/supervisor/garage/equipment/${id}/edit`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Edit className="h-4 w-4" /> Edit
                        </Button>
                    </Link>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2"
                    >
                        <Trash className="h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Maintenance Cost"
                    value={`KES ${analytics.total_maintenance_cost.toLocaleString()}`}
                    icon={DollarSign}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Usage Hours"
                    value={`${analytics.total_usage_hours.toFixed(1)}h`}
                    icon={Clock}
                    color="#10b981"
                />
                <StatCard
                    title="Uptime"
                    value={`${analytics.uptime_percentage}%`}
                    icon={TrendingUp}
                    color="#3b82f6"
                />
                <StatCard
                    title="Efficiency Rating"
                    value={`${analytics.efficiency_rating}%`}
                    icon={BarChart3}
                    color="#f59e0b"
                />
            </div>

            {/* Enhanced Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    <TabsTrigger value="usage">Usage History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard title="Equipment Information">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                                            Basic Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Name:</span> {equipment.name}</div>
                                            <div><span className="font-medium">Serial Number:</span> {equipment.serial_number || 'Not specified'}</div>
                                            <div><span className="font-medium">Purchase Date:</span> {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'Not specified'}</div>
                                            <div><span className="font-medium">Cost:</span> {equipment.cost ? `KES ${Number(equipment.cost).toLocaleString()}` : 'Not specified'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                                            Status & Condition
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-medium">Current Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                                    equipment.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                                    equipment.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                                                    equipment.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {equipment.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Condition:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                                    equipment.condition === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                                                    equipment.condition === 'GOOD' ? 'bg-blue-100 text-blue-800' :
                                                    equipment.condition === 'FAIR' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-orange-100 text-orange-800'
                                                }`}>
                                                    {equipment.condition}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Last Maintenance:</span>
                                                {analytics.last_maintenance ? 
                                                    new Date(analytics.last_maintenance).toLocaleDateString() : 
                                                    'No maintenance recorded'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {equipment.description && (
                                    <div>
                                        <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Description</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg">{equipment.description}</p>
                                    </div>
                                )}
                                {equipment.notes && (
                                    <div>
                                        <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Notes</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg">{equipment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Quick Stats">
                            <div className="space-y-4">
                                <div className="text-center p-6">
                                    <div className="text-3xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                        {analytics.maintenance_frequency}
                                    </div>
                                    <div className="text-sm text-gray-500">Maintenance Records</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span>Average usage per session:</span>
                                        <span className="font-medium">{analytics.average_usage_per_session.toFixed(1)}h</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total usage hours:</span>
                                        <span className="font-medium">{analytics.total_usage_hours.toFixed(1)}h</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Maintenance cost:</span>
                                        <span className="font-medium">KES {analytics.total_maintenance_cost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Efficiency rating:</span>
                                        <span className="font-medium">{analytics.efficiency_rating}%</span>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </div>
                </TabsContent>

                <TabsContent value="maintenance">
                    <DashboardCard title="Maintenance History" className="min-h-[500px]">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    {maintenanceRecords.length} maintenance record{maintenanceRecords.length !== 1 ? 's' : ''} found
                                </span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    style={{ backgroundColor: colors.supervisorPrimary, color: 'white' }}
                                >
                                    <Wrench size={14} className="mr-2" />
                                    Schedule Maintenance
                                </Button>
                            </div>
                            {maintenanceRecords.length > 0 ? (
                                <div className="space-y-4">
                                    {maintenanceRecords.map((record, index) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold capitalize">{record.type} Maintenance</h4>
                                                    <p className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">KES {record.cost.toLocaleString()}</div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{record.description}</p>
                                            <div className="text-xs text-gray-500">Technician: {record.technician}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Wrench size={64} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Maintenance History</h3>
                                    <p className="text-gray-500 mb-6">No maintenance records found for this equipment</p>
                                    <Button style={{ backgroundColor: colors.supervisorPrimary }} className="text-white">
                                        Schedule First Maintenance
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </TabsContent>

                <TabsContent value="usage">
                    <DashboardCard title="Usage History">
                        <div className="space-y-4">
                            {usageRecords.length > 0 ? (
                                <div className="space-y-3">
                                    {usageRecords.map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">{record.purpose}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(record.date).toLocaleDateString()}
                                                    <span className="mx-2">•</span>
                                                    <span>Used by: {record.used_by}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">{record.duration}h</div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                    {record.condition_after}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="font-medium text-gray-900 mb-2">No Usage History</h3>
                                    <p className="text-sm text-gray-500">Usage tracking will appear here</p>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard title="Performance Metrics">
                            <div className="space-y-4">
                                <div className="text-center p-6">
                                    <div className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                        {analytics.efficiency_rating}%
                                    </div>
                                    <div className="text-sm text-gray-500">Overall Efficiency</div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Uptime</span>
                                            <span>{analytics.uptime_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-600"
                                                style={{ width: `${analytics.uptime_percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Efficiency</span>
                                            <span>{analytics.efficiency_rating}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                                style={{ width: `${analytics.efficiency_rating}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Cost Analysis">
                            <div className="space-y-4">
                                <div className="text-center p-6">
                                    <div className="text-2xl font-bold text-green-600">
                                        KES {analytics.total_maintenance_cost.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Maintenance Investment</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-700">
                                            {analytics.maintenance_frequency}
                                        </div>
                                        <div className="text-xs text-blue-600">Services</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-700">
                                            KES {analytics.maintenance_frequency > 0 ? Math.round(analytics.total_maintenance_cost / analytics.maintenance_frequency).toLocaleString() : 0}
                                        </div>
                                        <div className="text-xs text-green-600">Avg. Cost</div>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Equipment"
                message="Are you sure you want to delete this equipment? This action will remove all related data and cannot be undone."
                itemDetails={equipment ? [
                    { label: "Name", value: equipment.name },
                    { label: "Serial Number", value: equipment.serial_number || 'Not specified' },
                    { label: "Status", value: equipment.status || 'Unknown' },
                    { label: "Condition", value: equipment.condition || 'Unknown' },
                    { label: "Value", value: equipment.cost ? `KES ${Number(equipment.cost).toLocaleString()}` : 'Not specified' }
                ] : []}
                isDeleting={deleteModal.isDeleting}
            />
        </motion.div>
    )
}