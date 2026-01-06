'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchVehicle, Vehicle, fetchJobCards, deleteVehicle } from '@/lib/api'
import {
    ArrowLeft,
    Edit,
    Trash,
    Wrench,
    Car,
    Calendar,
    DollarSign,
    Activity,
    History,
    AlertTriangle,
    CheckCircle,
    Clock,
    MapPin,
    User,
    Phone,
    FileText,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

interface JobCard {
    id: number
    registration_number: string
    client_name: string
    client_phone?: string
    make?: string
    model?: string
    defects?: string
    repairs?: string
    job_cost?: number
    status: string
    date_created: string
    mechanic_status?: string
}

export default function GarageVehicleDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const id = params.id as string
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [jobCards, setJobCards] = useState<JobCard[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        isDeleting: false
    })

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const vehicleResult = await fetchVehicle(Number(id));
                setVehicle(vehicleResult);

                // Fetch job cards for this specific vehicle registration
                const jobCardsResponse = await fetchJobCards(1, 100, {
                    registration_number: vehicleResult.registration_number
                });
                setJobCards(jobCardsResponse.results || []);
            } catch (error) {
                console.error('Error loading vehicle data:', error)
                toast({
                    title: "Error",
                    description: "Failed to load vehicle data. Please try again.",
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
        if (!vehicle) return

        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await deleteVehicle(vehicle.id)
            toast({
                title: "Success",
                description: "Vehicle deleted successfully",
            })
            router.push('/supervisor/garage/vehicles')
        } catch (error: any) {
            console.error('Error deleting vehicle:', error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to delete vehicle. Please try again.",
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

    if (!vehicle) {
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
                    <h2 className="text-3xl font-bold tracking-tight">Vehicle Details</h2>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Car size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Vehicle Not Found</h3>
                        <p className="text-gray-500">The vehicle you're looking for doesn't exist.</p>
                        <Link href="/supervisor/garage/vehicles" className="mt-4 inline-block">
                            <Button variant="outline">Back to Vehicles</Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        )
    }

    // Calculate service statistics
    const serviceStats = {
        total_services: jobCards.length,
        total_cost: jobCards.reduce((sum, job) => sum + (Number(job.job_cost || 0) || 0), 0),
        completed_services: jobCards.filter(job => job.status === 'completed').length,
        last_service: jobCards.length > 0 ? jobCards[0].date_created : null,
        average_cost: jobCards.length > 0 ? jobCards.reduce((sum, job) => sum + (Number(job.job_cost || 0) || 0), 0) / jobCards.length : 0
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
                        <Car size={24} style={{ color: colors.supervisorPrimary }} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                            {vehicle.registration_number}
                        </h1>
                        <div className="flex items-center gap-2 text-lg" style={{ color: colors.textSecondary }}>
                            <span>{vehicle.make} {vehicle.model}</span>
                            {/* Year removed as not in interface */}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                vehicle.status === 'IN_GARAGE' ? 'bg-blue-100 text-blue-800' :
                                    vehicle.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}>
                                {vehicle.status?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${vehicle.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                }`}>
                                {vehicle.classification}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/supervisor/garage/vehicles/${id}/edit`}>
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

            {/* Service Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Services"
                    value={serviceStats.total_services.toString()}
                    icon={Activity}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Total Service Cost"
                    value={`KES ${serviceStats.total_cost.toLocaleString()}`}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Completed Jobs"
                    value={serviceStats.completed_services.toString()}
                    icon={CheckCircle}
                    color="#3b82f6"
                />
                <StatCard
                    title="Average Cost"
                    value={`KES ${serviceStats.average_cost.toFixed(0)}`}
                    icon={TrendingUp}
                    color="#f59e0b"
                />
            </div>

            {/* Enhanced Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="service-history">Service History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard title="Vehicle Information">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                                            Basic Details
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">Make:</span> {vehicle.make}</div>
                                            <div><span className="font-medium">Model:</span> {vehicle.model}</div>
                                            <div><span className="font-medium">Color:</span> {vehicle.color || 'Not specified'}</div>
                                            <div><span className="font-medium">Type:</span> {vehicle.vehicle_type || 'Not specified'}</div>
                                            <div><span className="font-medium">VIN:</span> {vehicle.vin || 'Not specified'}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
                                            Status & Classification
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="font-medium">Current Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                                                    vehicle.status === 'IN_GARAGE' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-orange-100 text-orange-800'
                                                    }`}>
                                                    {vehicle.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Classification:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${vehicle.classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {vehicle.classification}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Last Service:</span>
                                                {serviceStats.last_service ?
                                                    new Date(serviceStats.last_service).toLocaleDateString() :
                                                    'No services recorded'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {vehicle.notes && (
                                    <div>
                                        <h4 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Notes</h4>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg">{vehicle.notes}</p>
                                    </div>
                                )}
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Recent Service Activity">
                            {jobCards.length > 0 ? (
                                <div className="space-y-3">
                                    {jobCards.slice(0, 5).map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium">Job Card #{job.id}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(job.date_created).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    KES {Number(job.job_cost || 0).toLocaleString()}
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {jobCards.length > 5 && (
                                        <Link href={`/supervisor/garage/vehicles/${vehicle.registration_number}/history`}>
                                            <Button variant="outline" className="w-full">
                                                View All {jobCards.length} Services
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="font-medium text-gray-900 mb-2">No Service History</h3>
                                    <p className="text-sm text-gray-500 mb-4">This vehicle has no recorded services</p>
                                    <Link href="/supervisor/garage/job-cards/add">
                                        <Button size="sm" style={{ backgroundColor: colors.supervisorPrimary }} className="text-white">
                                            Create Job Card
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </DashboardCard>
                    </div>
                </TabsContent>

                <TabsContent value="service-history">
                    <DashboardCard title="Complete Service History" className="min-h-[500px]">
                        {jobCards.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        {jobCards.length} service record{jobCards.length !== 1 ? 's' : ''} found
                                    </span>
                                    <Link href={`/supervisor/garage/vehicles/${vehicle.registration_number}/history`}>
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                            <History size={14} />
                                            Detailed History
                                        </Button>
                                    </Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-2">Date</th>
                                                <th className="text-left p-2">Job Card #</th>
                                                <th className="text-left p-2">Status</th>
                                                <th className="text-left p-2">Cost</th>
                                                <th className="text-left p-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobCards.map((job) => (
                                                <tr key={job.id} className="border-b hover:bg-gray-50">
                                                    <td className="p-2">{new Date(job.date_created).toLocaleDateString()}</td>
                                                    <td className="p-2">#{job.id}</td>
                                                    <td className="p-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-2">KES {Number(job.job_cost || 0).toLocaleString()}</td>
                                                    <td className="p-2">
                                                        <Link href={`/supervisor/garage/job-cards/${job.id}`}>
                                                            <Button size="sm" variant="outline">View</Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Wrench size={64} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Service History</h3>
                                <p className="text-gray-500 mb-6">This vehicle hasn't been serviced yet</p>
                                <Link href="/supervisor/garage/job-cards/add">
                                    <Button style={{ backgroundColor: colors.supervisorPrimary }} className="text-white">
                                        Create First Job Card
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </DashboardCard>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard title="Cost Analysis">
                            <div className="space-y-4">
                                <div className="text-center p-6">
                                    <div className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                        KES {serviceStats.total_cost.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Service Investment</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Average per service:</span>
                                        <span className="font-medium">KES {serviceStats.average_cost.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total services:</span>
                                        <span className="font-medium">{serviceStats.total_services}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Completion rate:</span>
                                        <span className="font-medium">
                                            {serviceStats.total_services > 0
                                                ? Math.round((serviceStats.completed_services / serviceStats.total_services) * 100)
                                                : 0
                                            }%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Service Performance">
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600">
                                    Service completion and efficiency metrics
                                </div>
                                {serviceStats.total_services > 0 ? (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Completed</span>
                                                <span>{serviceStats.completed_services}/{serviceStats.total_services}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-600"
                                                    style={{ width: `${(serviceStats.completed_services / serviceStats.total_services) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="text-lg font-bold text-green-700">{serviceStats.completed_services}</div>
                                                <div className="text-xs text-green-600">Completed</div>
                                            </div>
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-bold text-blue-700">
                                                    {serviceStats.total_services - serviceStats.completed_services}
                                                </div>
                                                <div className="text-xs text-blue-600">In Progress</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-500">
                                        No performance data available
                                    </div>
                                )}
                            </div>
                        </DashboardCard>
                    </div>
                </TabsContent>

                <TabsContent value="documents">
                    <DashboardCard title="Vehicle Documents">
                        <div className="text-center py-12">
                            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
                            <p className="text-gray-500 mb-6">
                                Vehicle document management system coming soon
                            </p>
                            <div className="text-sm text-gray-400">
                                Features will include: Registration documents, Insurance papers,
                                Service certificates, and Inspection reports
                            </div>
                        </div>
                    </DashboardCard>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Vehicle"
                message="Are you sure you want to delete this vehicle? This action will remove all related data and cannot be undone."
                itemDetails={vehicle ? [
                    { label: "Registration", value: vehicle.registration_number },
                    { label: "Make & Model", value: `${vehicle.make} ${vehicle.model}` },
                    { label: "Status", value: vehicle.status || 'Unknown' },
                    { label: "Services", value: `${serviceStats.total_services} recorded` }
                ] : []}
                isDeleting={deleteModal.isDeleting}
            />
        </motion.div>
    )
}
