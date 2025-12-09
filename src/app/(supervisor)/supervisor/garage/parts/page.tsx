'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { fetchParts, Part } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'

const columns: ColumnDef<Part>[] = [
    {
        accessorKey: 'part_number',
        header: 'Part Number',
        cell: ({ row }) => <span className="font-medium">{row.getValue('part_number')}</span>
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'stock_quantity',
        header: 'In Stock',
        cell: ({ row }) => {
            const quantity = Number(row.getValue('stock_quantity'));
            const minStock = Number(row.original.min_stock_level || 0);
            return (
                <span className={`font-bold ${quantity <= minStock ? 'text-red-600' : 'text-green-600'}`}>
                    {quantity} {row.original.unit}
                </span>
            )
        }
    },
    {
        accessorKey: 'cost_price',
        header: 'Cost Price',
        cell: ({ row }) => `KES ${Number(row.getValue('cost_price')).toLocaleString()}`
    },
    {
        accessorKey: 'selling_price',
        header: 'Selling Price',
        cell: ({ row }) => `KES ${Number(row.getValue('selling_price')).toLocaleString()}`
    },
]

export default function GaragePartsPage() {
    const [data, setData] = useState<Part[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchParts()
                setData(result.results || [])
            } catch (error) {
                console.error('Error loading parts:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Parts Inventory</h2>
                {/* TODO: Add logic to create new part functionality or reuse existing */}
                {/* <Link href="/supervisor/garage/parts/add"> */}
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" /> Add Part (Coming Soon)
                </Button>
                {/* </Link> */}
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
