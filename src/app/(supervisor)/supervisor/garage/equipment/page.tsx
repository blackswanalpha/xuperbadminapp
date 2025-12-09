'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { fetchEquipmentList, Equipment } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Equipment>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <Link href={`/supervisor/garage/equipment/${row.original.id}/edit`} className="hover:underline font-medium">{row.getValue('name')}</Link>
    },
    {
        accessorKey: 'serial_number',
        header: 'Serial Number',
    },
    {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => <span className="capitalize">{String(row.getValue('condition')).toLowerCase()}</span>
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
        ${row.getValue('status') === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {String(row.getValue('status')).replace('_', ' ')}
            </span>
        )
    },
]

export default function GarageEquipmentPage() {
    const [data, setData] = useState<Equipment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchEquipmentList()
                setData(result)
            } catch (error) {
                console.error('Error loading equipment:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Equipment</h2>
                <Link href="/supervisor/garage/equipment/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Equipment
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-white p-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="name" />
                )}
            </div>
        </div>
    )
}
