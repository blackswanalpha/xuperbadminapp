'use client'

import { useState, useEffect } from 'react'
import { Plus, Car, History, Wrench, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchJobCards } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

const columns: ColumnDef<ClientVehicle>[] = [
    {
        accessorKey: 'registration_number',
        header: 'Vehicle Reg',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                    <Car size={18} className="text-gray-600" />
                </div>
                <div>
                    <span className="font-bold text-gray-900 block">{row.getValue('registration_number')}</span>
                    <span className="text-xs text-gray-500">{row.original.make} {row.original.model}</span>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'client_name',
        header: 'Owner Details',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-gray-900">{row.getValue('client_name')}</span>
                <span className="text-xs text-gray-500">{row.original.client_phone}</span>
            </div>
        )
    },
    {
        accessorKey: 'latest_status',
        header: 'Current Status',
        cell: ({ row }) => {
            const status = row.original.latest_status?.toLowerCase();
            const isActive = status !== 'completed' && status !== 'cancelled';
            return (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                    {isActive ? 'In Service' : 'Idle'}
                </span>
            )
        }
    },
    {
        accessorKey: 'visit_count',
        header: 'Service History',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{row.getValue('visit_count')}</span>
                <span className="text-xs text-gray-500">Visits</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">Last: {new Date(row.original.last_visit).toLocaleDateString()}</span>
            </div>
        )
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Link
                href={`/supervisor/garage/job-cards/${row.original.latest_job_card_id}`}
                className="text-sm font-medium hover:underline flex items-center gap-1"
                style={{ color: colors.supervisorPrimary }}
            >
                View Latest <History size={14} />
            </Link>
        )
    }
]

export default function GarageVehiclesPage() {
    const [data, setData] = useState<ClientVehicle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const jobCards = await fetchJobCards()

                // Process job cards to extract unique vehicles
                const vehicleMap = new Map<string, ClientVehicle>()

                jobCards.forEach(job => {
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
                            existing.client_name = job.client_name // Update client details to latest
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
            } catch (error) {
                console.error('Error loading vehicles from job cards:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const derivedStats = {
        total_serviced: data.length,
        in_garage: data.filter(v => {
            const s = v.latest_status?.toLowerCase();
            return s && s !== 'completed' && s !== 'cancelled';
        }).length,
        returning: data.filter(v => v.visit_count > 1).length
    }

    const activeVehicles = data.filter(v => {
        const s = v.latest_status?.toLowerCase();
        return s && s !== 'completed' && s !== 'cancelled';
    });

    const historyVehicles = data.filter(v => {
        const s = v.latest_status?.toLowerCase();
        return !s || s === 'completed' || s === 'cancelled';
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Client Vehicles
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Directory of all vehicles serviced in the garage
                    </p>
                </div>
                <Link href="/supervisor/garage/job-cards/add">
                    <Button
                        className="flex items-center gap-2"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Plus size={16} /> New Job Card
                    </Button>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Vehicles Serviced"
                    value={derivedStats.total_serviced.toString()}
                    icon={Car}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Currently In Garage"
                    value={derivedStats.in_garage.toString()}
                    icon={Wrench}
                    color="#f59e0b" // Amber
                />
                <StatCard
                    title="Returning Clients"
                    value={derivedStats.returning.toString()}
                    icon={History}
                    color="#8b5cf6" // Violet
                />
            </div>

            <DashboardCard title="Vehicle Registry" className="min-h-[500px]">
                <Tabs defaultValue="all" className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <TabsList className="bg-gray-100">
                            <TabsTrigger value="all">All Vehicles</TabsTrigger>
                            <TabsTrigger value="active">In Garage</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        {/* 
                         TODO: Add filter dropdown if needed
                         <Button variant="outline" size="sm" className="gap-2 text-gray-600">
                            <Filter size={14} /> Filter
                        </Button>
                        */}
                    </div>

                    <TabsContent value="all" className="mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <DataTable columns={columns} data={data} searchKey="registration_number" />
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="mt-0">
                        <DataTable columns={columns} data={activeVehicles} searchKey="registration_number" />
                    </TabsContent>

                    <TabsContent value="history" className="mt-0">
                        <DataTable columns={columns} data={historyVehicles} searchKey="registration_number" />
                    </TabsContent>
                </Tabs>
            </DashboardCard>
        </motion.div>
    )
}
