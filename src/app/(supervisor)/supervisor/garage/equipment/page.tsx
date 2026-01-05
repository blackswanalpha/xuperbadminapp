'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Settings, Edit, Trash2, Eye, CheckCircle, AlertTriangle, Wrench, Package } from 'lucide-react'
import Link from 'next/link'
import { fetchEquipmentList, Equipment, deleteEquipment } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import DeleteConfirmationModal from '@/components/shared/delete-confirmation-modal'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/use-toast'

// Enhanced columns with better UI and actions
const createEquipmentColumns = (onDelete: (equipment: Equipment) => void): ColumnDef<Equipment>[] => [
    {
        accessorKey: 'name',
        header: 'Equipment Details',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${colors.supervisorPrimary}15` }}
                >
                    <Settings size={18} style={{ color: colors.supervisorPrimary }} />
                </div>
                <div>
                    <div className="font-bold text-gray-900">{row.getValue('name')}</div>
                    <div className="text-sm text-gray-500">
                        {row.original.serial_number ? `SN: ${row.original.serial_number}` : 'No serial number'}
                    </div>
                    <div className="text-xs text-gray-400">
                        Added: {new Date(row.original.created_at || '').toLocaleDateString()}
                    </div>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => {
            const condition = row.getValue('condition') as string;
            const conditionColors = {
                'EXCELLENT': 'bg-green-100 text-green-800 border-green-200',
                'GOOD': 'bg-blue-100 text-blue-800 border-blue-200',
                'FAIR': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                'POOR': 'bg-orange-100 text-orange-800 border-orange-200',
                'DAMAGED': 'bg-red-100 text-red-800 border-red-200'
            };
            return (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    conditionColors[condition as keyof typeof conditionColors] || 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                    {condition}
                </span>
            )
        }
    },
    {
        accessorKey: 'status',
        header: 'Availability',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const statusConfig = {
                'AVAILABLE': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
                'IN_USE': { color: 'bg-blue-100 text-blue-800', icon: Settings },
                'MAINTENANCE': { color: 'bg-yellow-100 text-yellow-800', icon: Wrench },
                'RETIRED': { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
            };
            const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.AVAILABLE;
            const StatusIcon = config.icon;
            
            return (
                <div className="flex items-center gap-2">
                    <StatusIcon size={14} className={`${config.color.split(' ')[1]} text-current`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: 'cost',
        header: 'Value',
        cell: ({ row }) => {
            const cost = row.original.cost;
            return cost ? (
                <div className="text-right">
                    <div className="font-medium">KES {Number(cost).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Purchase Price</div>
                </div>
            ) : (
                <span className="text-gray-400">—</span>
            )
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const equipment = row.original;
            return (
                <div className="flex items-center gap-1">
                    <Link href={`/supervisor/garage/equipment/${equipment.id}`}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/supervisor/garage/equipment/${equipment.id}/edit`}>
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
                        onClick={() => onDelete(equipment)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    }
]

export default function GarageEquipmentPage() {
    const { toast } = useToast()
    const [data, setData] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        equipment: null as Equipment | null,
        isDeleting: false
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchEquipmentList()
                setData(result)
            } catch (error) {
                console.error('Error loading equipment:', error)
                toast({
                    title: "Error",
                    description: "Failed to load equipment data. Please refresh the page.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [toast])

    const handleDeleteClick = (equipment: Equipment) => {
        setDeleteModal({
            isOpen: true,
            equipment,
            isDeleting: false
        })
    }

    const handleDeleteConfirm = async () => {
        if (!deleteModal.equipment) return

        setDeleteModal(prev => ({ ...prev, isDeleting: true }))

        try {
            await deleteEquipment(deleteModal.equipment.id)
            
            // Remove from local state
            setData(prevData => prevData.filter(e => e.id !== deleteModal.equipment?.id))
            
            toast({
                title: "Success",
                description: "Equipment deleted successfully",
            })
            
            setDeleteModal({
                isOpen: false,
                equipment: null,
                isDeleting: false
            })
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
            equipment: null,
            isDeleting: false
        })
    }

    // Calculate stats
    const stats = {
        total_equipment: data.length,
        available: data.filter(e => e.status === 'AVAILABLE').length,
        in_use: data.filter(e => e.status === 'IN_USE').length,
        maintenance: data.filter(e => e.status === 'MAINTENANCE').length,
        total_value: data.reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
        excellent_condition: data.filter(e => e.condition === 'EXCELLENT').length,
        good_condition: data.filter(e => e.condition === 'GOOD').length,
        needs_attention: data.filter(e => ['FAIR', 'POOR', 'DAMAGED'].includes(e.condition)).length
    }

    const columns = createEquipmentColumns(handleDeleteClick)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 space-y-6 p-4 md:p-8 pt-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Equipment Management
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Manage garage tools, machinery, and equipment inventory
                    </p>
                </div>
                <Link href="/supervisor/garage/equipment/add">
                    <Button 
                        className="flex items-center gap-2 text-white hover:opacity-90"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Plus size={16} /> Add Equipment
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Equipment"
                    value={stats.total_equipment.toString()}
                    icon={Package}
                    color={colors.supervisorPrimary}
                    trend={stats.total_equipment > 0 ? { value: `${stats.available} Available`, isPositive: true } : undefined}
                />
                <StatCard
                    title="Currently Available"
                    value={stats.available.toString()}
                    icon={CheckCircle}
                    color="#10b981"
                />
                <StatCard
                    title="In Maintenance"
                    value={stats.maintenance.toString()}
                    icon={Wrench}
                    color="#f59e0b"
                    trend={stats.needs_attention > 0 ? { value: `${stats.needs_attention} Need Attention`, isPositive: false } : undefined}
                />
                <StatCard
                    title="Total Value"
                    value={`KES ${stats.total_value.toLocaleString()}`}
                    icon={Package}
                    color="#8b5cf6"
                />
            </div>

            {/* Equipment Condition Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Condition Overview">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Excellent</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="h-2 bg-green-500 rounded-full"
                                        style={{ width: `${stats.total_equipment > 0 ? (stats.excellent_condition / stats.total_equipment) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{stats.excellent_condition}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Good</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="h-2 bg-blue-500 rounded-full"
                                        style={{ width: `${stats.total_equipment > 0 ? (stats.good_condition / stats.total_equipment) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{stats.good_condition}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Needs Attention</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="h-2 bg-orange-500 rounded-full"
                                        style={{ width: `${stats.total_equipment > 0 ? (stats.needs_attention / stats.total_equipment) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold">{stats.needs_attention}</span>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Usage Status">
                    <div className="space-y-3">
                        <div className="text-center p-4">
                            <div className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                {stats.total_equipment > 0 ? Math.round((stats.available / stats.total_equipment) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-500">Equipment Available</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-green-50 rounded">
                                <div className="text-lg font-bold text-green-700">{stats.available}</div>
                                <div className="text-xs text-green-600">Available</div>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="text-lg font-bold text-blue-700">{stats.in_use}</div>
                                <div className="text-xs text-blue-600">In Use</div>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Quick Actions">
                    <div className="space-y-3">
                        <Link href="/supervisor/garage/equipment/add">
                            <Button 
                                className="w-full justify-start text-white"
                                style={{ backgroundColor: colors.supervisorPrimary }}
                            >
                                <Plus size={16} className="mr-2" />
                                Add New Equipment
                            </Button>
                        </Link>
                        <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => window.location.reload()}
                        >
                            <Settings size={16} className="mr-2" />
                            Refresh Data
                        </Button>
                        {stats.needs_attention > 0 && (
                            <Button 
                                variant="outline" 
                                className="w-full justify-start border-orange-200 text-orange-700"
                            >
                                <AlertTriangle size={16} className="mr-2" />
                                Review {stats.needs_attention} Items
                            </Button>
                        )}
                    </div>
                </DashboardCard>
            </div>

            {/* Equipment Table */}
            <DashboardCard title="Equipment Inventory" className="min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : data.length > 0 ? (
                    <DataTable columns={columns} data={data} searchKey="name" />
                ) : (
                    <div className="text-center py-12">
                        <Settings size={64} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
                        <p className="text-gray-500 mb-6">Get started by adding your first piece of equipment</p>
                        <Link href="/supervisor/garage/equipment/add">
                            <Button 
                                style={{ backgroundColor: colors.supervisorPrimary }} 
                                className="text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Equipment
                            </Button>
                        </Link>
                    </div>
                )}
            </DashboardCard>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Equipment"
                message="Are you sure you want to delete this equipment? This action will remove all related data and cannot be undone."
                itemDetails={deleteModal.equipment ? [
                    { label: "Name", value: deleteModal.equipment.name },
                    { label: "Serial Number", value: deleteModal.equipment.serial_number || 'Not specified' },
                    { label: "Status", value: deleteModal.equipment.status },
                    { label: "Condition", value: deleteModal.equipment.condition },
                    { label: "Value", value: deleteModal.equipment.cost ? `KES ${Number(deleteModal.equipment.cost).toLocaleString()}` : 'Not specified' }
                ] : []}
                isDeleting={deleteModal.isDeleting}
            />
        </motion.div>
    )
}
