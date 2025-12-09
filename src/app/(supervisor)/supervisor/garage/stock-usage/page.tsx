'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchStockUsage, StockUsage } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<StockUsage>[] = [
    {
        accessorKey: 'date_used',
        header: 'Date',
        cell: ({ row }) => new Date(row.getValue('date_used')).toLocaleDateString()
    },
    {
        accessorKey: 'part_name',
        header: 'Part',
    },
    {
        accessorKey: 'vehicle_registration',
        header: 'Vehicle',
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ row }) => <span className="font-bold">{row.getValue('quantity')}</span>
    },
    {
        accessorKey: 'technician_name',
        header: 'Technician',
    },
    {
        accessorKey: 'reason',
        header: 'Reason',
    },
]

export default function GarageStockUsagePage() {
    const [data, setData] = useState<StockUsage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchStockUsage()
                setData(result.results || [])
            } catch (error) {
                console.error('Error loading stock usage:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Stock Usage History</h2>
            </div>

            <div className="rounded-md border bg-white p-4">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="part_name" />
                )}
            </div>
        </div>
    )
}
