'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fetchJobCards, JobCard } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

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
}

const columns: ColumnDef<ClientVehicle>[] = [
    {
        accessorKey: 'registration_number',
        header: 'Reg Number',
        cell: ({ row }) => <span className="font-medium">{row.getValue('registration_number')}</span>
    },
    {
        accessorKey: 'make',
        header: 'Make',
    },
    {
        accessorKey: 'model',
        header: 'Model',
    },
    {
        accessorKey: 'client_name',
        header: 'Client',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span>{row.getValue('client_name')}</span>
                <span className="text-xs text-muted-foreground">{row.original.client_phone}</span>
            </div>
        )
    },
    {
        accessorKey: 'visit_count',
        header: 'Visits',
        cell: ({ row }) => <span className="text-center block">{row.getValue('visit_count')}</span>
    },
    {
        accessorKey: 'last_visit',
        header: 'Last Visit',
        cell: ({ row }) => new Date(row.getValue('last_visit')).toLocaleDateString()
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Link href={`/supervisor/garage/job-cards/${row.original.latest_job_card_id}`} className="text-blue-600 hover:underline text-sm">
                View Last Job
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
                            latest_job_card_id: job.id
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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Client Vehicles</h2>
                <Link href="/supervisor/garage/job-cards/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Job Card
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white p-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="registration_number" />
                )}
            </div>
        </div>
    )
}

