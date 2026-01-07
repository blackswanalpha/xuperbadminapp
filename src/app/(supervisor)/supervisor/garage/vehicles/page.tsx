'use client'

import { useState, useEffect } from 'react'
import { Plus, Car, History, Wrench, Search, Filter, Eye, Edit, Trash2, Calendar, User, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchJobCards, deleteVehicle, fetchVehicles } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Vehicle } from '@/types/common'

// Derived type for Client Vehicle based on Job Card data
interface ClientVehicle {
    registration_number: string
    make: string
    model: string
    client_name: string
    client_phone: string
    last_visit: string
    visit_count: number
    latest_job_card_id: number
    latest_status: string
}

// Enhanced columns with better UI and actions
const createClientVehicleColumns = (onDelete: (vehicle: ClientVehicle) => void): ColumnDef<ClientVehicle>[] => [
    {
        accessorKey: 'registration_number',
        header: 'Vehicle Information',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${colors.supervisorPrimary}15` }}
                >
                    <Car size={18} style={{ color: colors.supervisorPrimary }} />
                </div>
                <div>
                    <span className="font-bold text-gray-900 block">{row.getValue('registration_number')}</span>
                    <span className="text-sm text-gray-600">{row.original.make} {row.original.model}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <User size={12} />
                        <span>{row.original.client_name}</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'client_name',
        header: 'Contact Information',
        cell: ({ row }) => (
            <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-1">
                    <User size={12} className="text-gray-500" />
                    <span className="font-medium text-gray-900">{row.getValue('client_name')}</span>
                </div>
                {row.original.client_phone && (
                    <div className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-500" />
                        <span className="text-sm text-gray-600">{row.original.client_phone}</span>
                    </div>
                )}
            </div>
        )
    },
    {
        accessorKey: 'latest_status',
        header: 'Service Status',
        cell: ({ row }) => {
            const status = row.original.latest_status?.toLowerCase();
            const isActive = status !== 'completed' && status !== 'cancelled';
            return (
                <div className="flex flex-col space-y-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {isActive ? 'In Service' : 'Completed'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Last: {new Date(row.original.last_visit).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: 'visit_count',
        header: 'Service History',
        cell: ({ row }) => (
            <div className="flex flex-col items-center">
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                    style={{ backgroundColor: colors.supervisorPrimary }}
                >
                    {row.getValue('visit_count')}
                </div>
                <span className="text-xs text-gray-500 mt-1">Visits</span>
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const vehicle = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Link href={`/supervisor/garage/job-cards/${vehicle.latest_job_card_id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(`/supervisor/garage/vehicles/${vehicle.registration_number}/history`, '_blank')}
                    >
                        <History className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }
]

// Enhanced columns for dedicated vehicles
const createVehicleColumns = (onDelete: (vehicle: Vehicle) => void): ColumnDef<Vehicle>[] => [
    {
        accessorKey: 'registration_number',
        header: 'Vehicle Details',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${colors.supervisorPrimary}15` }}
                >
                    <Car size={18} style={{ color: colors.supervisorPrimary }} />
                </div>
                <div>
                    <span className="font-bold text-gray-900 block">{row.getValue('registration_number')}</span>
                    <span className="text-sm text-gray-600">{row.original.make} {row.original.model}</span>
                    <span className="text-xs text-gray-500 block">{row.original.color} • {row.original.vehicle_type}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            const statusColors = {
                'AVAILABLE': 'bg-green-50 text-green-700 border-green-200',
                'IN_GARAGE': 'bg-blue-50 text-blue-700 border-blue-200',
                'HIRED': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                'MAINTENANCE': 'bg-orange-50 text-orange-700 border-orange-200'
            };
            return (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status as keyof typeof statusColors] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {status?.replace('_', ' ')}
                </span>
            )
        }
    },
    {
        accessorKey: 'classification',
        header: 'Type',
        cell: ({ row }) => {
            const classification = row.original.classification;
            return (
                <span className={`px-2 py-1 rounded text-xs font-medium ${classification === 'INTERNAL' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {classification}
                </span>
            )
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const vehicle = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Link href={`/supervisor/garage/vehicles/${vehicle.id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/supervisor/garage/vehicles/${vehicle.id}/edit`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(vehicle)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }
]

export default function GarageVehiclesPage() {
    const { toast } = useToast()
    const [data, setData] = useState<ClientVehicle[]>([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('client-vehicles')
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        vehicle: null as Vehicle | null,
        isDeleting: false
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load both job cards data and dedicated vehicles
                const [jobCards, vehiclesResult] = await Promise.all([
                    fetchJobCards(),
                    fetchVehicles().catch(e => ({ vehicles: [], totalCount: 0, totalPages: 0 }))
                ])

                // Process job cards to extract unique client vehicles
                const vehicleMap = new Map<string, ClientVehicle>()
                const jobCardsList = jobCards.results || []

                jobCardsList.forEach(job => {
                    const reg = job.registration_number.toUpperCase()
                    const existing = vehicleMap.get(reg)

                    if (!existing) {
                        vehicleMap.set(reg, {
                            registration_number: reg,
                            make: job.make || 'Unknown',
                            model: job.model || 'Unknown',
                            client_name: job.client_name,
                            client_phone: job.client_phone || '',
                            last_visit: job.date_created,
                            visit_count: 1,
                            latest_job_card_id: job.id,
                            latest_status: job.status
                        })
                    } else {
                        // Update if this job is more recent
                        if (new Date(job.date_created) > new Date(existing.last_visit)) {
                            existing.last_visit = job.date_created
                            existing.client_name = job.client_name
                            existing.client_phone = job.client_phone || existing.client_phone
                            existing.make = job.make || existing.make
                            existing.model = job.model || existing.model
                            existing.latest_job_card_id = job.id
                            existing.latest_status = job.status
                        }
                        existing.visit_count += 1
                    }
                })

                setData(Array.from(vehicleMap.values()))
                setVehicles(vehiclesResult.vehicles || [])
            } catch (error) {
                console.error('Error loading vehicles:', error)
                toast({
                    title: "Error",
                    description: "Failed to load vehicle data. Please refresh the page.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [toast])

    const handleDeleteClick = (vehicle: Vehicle) => {
        setDeleteModal({
            isOpen: true,
            vehicle,
            isDeleting: false
        })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModal.vehicle) return

        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await deleteVehicle(deleteModal.vehicle.id)

            setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== deleteModal.vehicle?.id))

            toast({
                title: "Success",
                description: "Vehicle deleted successfully",
            })

            setDeleteModal({
                isOpen: false,
                vehicle: null,
                isDeleting: false
            })
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
            vehicle: null,
            isDeleting: false
        })
    }

    // Enhanced stats calculations
    const clientVehicleStats = {
        total_serviced: data.length,
        in_garage: data.filter(v => {
            const s = v.latest_status?.toLowerCase();
            return s && s !== 'completed' && s !== 'cancelled';
        }).length,
        returning: data.filter(v => v.visit_count > 1).length
    }

    const ownVehicleStats = {
        total_vehicles: vehicles.length,
        available: vehicles.filter(v => v.status === 'AVAILABLE').length,
        in_garage: vehicles.filter(v => v.status === 'IN_GARAGE').length,
        maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length
    }

    // Filter functions
    const filteredClientVehicles = data.filter(v =>
        !searchTerm ||
        v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVehicles = vehicles.filter(v =>
        !searchTerm ||
        v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeClientVehicles = filteredClientVehicles.filter(v => {
        const s = v.latest_status?.toLowerCase();
        return s && s !== 'completed' && s !== 'cancelled';
    });

    const historyClientVehicles = filteredClientVehicles.filter(v => {
        const s = v.latest_status?.toLowerCase();
        return !s || s === 'completed' || s === 'cancelled';
    });

    const clientVehicleColumns = createClientVehicleColumns(() => { })
    const vehicleColumns = createVehicleColumns(handleDeleteClick)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Vehicle Management
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Comprehensive vehicle registry and service tracking system
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/supervisor/garage/vehicles/add">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Vehicle
                        </Button>
                    </Link>
                    <Link href="/supervisor/garage/job-cards/add">
                        <Button
                            className="flex items-center gap-2 text-white hover:opacity-90"
                            style={{ backgroundColor: colors.supervisorPrimary }}
                        >
                            <Plus size={16} /> New Job Card
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        placeholder="Search by registration, owner, make, or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4"
                    />
                </div>
            </div>

            <DashboardCard title="Vehicle Overview" className="min-h-[600px]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-6">
                        <TabsList className="bg-gray-100">
                            <TabsTrigger value="client-vehicles">Client Vehicles</TabsTrigger>
                            <TabsTrigger value="own-vehicles">Company Fleet</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="client-vehicles" className="mt-0 space-y-6">
                        {/* Client Vehicle Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Total Vehicles Serviced"
                                value={clientVehicleStats.total_serviced.toString()}
                                icon={Car}
                                color={colors.supervisorPrimary}
                            />
                            <StatCard
                                title="Currently In Service"
                                value={clientVehicleStats.in_garage.toString()}
                                icon={Wrench}
                                color="#f59e0b"
                            />
                            <StatCard
                                title="Returning Clients"
                                value={clientVehicleStats.returning.toString()}
                                icon={History}
                                color="#8b5cf6"
                            />
                        </div>

                        {/* Client Vehicle Tabs */}
                        <Tabs defaultValue="all-clients" className="w-full">
                            <div className="flex justify-between items-center mb-4">
                                <TabsList className="bg-gray-50">
                                    <TabsTrigger value="all-clients">All Client Vehicles</TabsTrigger>
                                    <TabsTrigger value="active-clients">In Service</TabsTrigger>
                                    <TabsTrigger value="history-clients">Service History</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="all-clients" className="mt-0">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <DataTable columns={clientVehicleColumns} data={filteredClientVehicles} searchKey="registration_number" />
                                )}
                            </TabsContent>

                            <TabsContent value="active-clients" className="mt-0">
                                <DataTable columns={clientVehicleColumns} data={activeClientVehicles} searchKey="registration_number" />
                            </TabsContent>

                            <TabsContent value="history-clients" className="mt-0">
                                <DataTable columns={clientVehicleColumns} data={historyClientVehicles} searchKey="registration_number" />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="own-vehicles" className="mt-0 space-y-6">
                        {/* Company Fleet Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Fleet"
                                value={ownVehicleStats.total_vehicles.toString()}
                                icon={Car}
                                color={colors.supervisorPrimary}
                            />
                            <StatCard
                                title="Available"
                                value={ownVehicleStats.available.toString()}
                                icon={Car}
                                color="#10b981"
                            />
                            <StatCard
                                title="In Garage"
                                value={ownVehicleStats.in_garage.toString()}
                                icon={Wrench}
                                color="#3b82f6"
                            />
                            <StatCard
                                title="Maintenance"
                                value={ownVehicleStats.maintenance.toString()}
                                icon={Wrench}
                                color="#f59e0b"
                            />
                        </div>

                        {/* Company Fleet Table */}
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <DataTable columns={vehicleColumns} data={filteredVehicles} searchKey="registration_number" />
                        )}
                    </TabsContent>
                </Tabs>
            </DashboardCard>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Vehicle"
                message="Are you sure you want to delete this vehicle? This action will remove all related data and cannot be undone."
                itemDetails={deleteModal.vehicle ? [
                    { label: "Registration", value: deleteModal.vehicle.registration_number },
                    { label: "Make & Model", value: `${deleteModal.vehicle.make} ${deleteModal.vehicle.model}` },
                    { label: "Status", value: deleteModal.vehicle.status || 'Unknown' },
                    { label: "Classification", value: deleteModal.vehicle.classification || 'Unknown' }
                ] : []}
                isDeleting={deleteModal.isDeleting}
            />
        </motion.div>
    )
}
