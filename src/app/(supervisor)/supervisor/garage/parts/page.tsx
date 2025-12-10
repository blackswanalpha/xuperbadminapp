'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Package, AlertTriangle, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { fetchParts, Part, fetchPartsStockSummary } from '@/lib/api'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'

const columns: ColumnDef<Part>[] = [
    {
        accessorKey: 'part_number',
        header: 'Part Number',
        cell: ({ row }) => <span className="font-medium text-gray-900">{row.getValue('part_number')}</span>
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
            <div>
                <div className="font-medium text-gray-900">{row.getValue('name')}</div>
                <div className="text-xs text-gray-500">{row.original.category_name}</div>
            </div>
        )
    },
    {
        accessorKey: 'current_stock',
        header: 'Stock Level',
        cell: ({ row }) => {
            const quantity = Number(row.original.current_stock);
            const minStock = Number(row.original.min_stock_level || 0);
            const isLow = quantity <= minStock;

            return (
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className={`font-medium ${isLow ? 'text-red-700' : 'text-gray-700'}`}>
                        {quantity} {row.original.unit}
                    </span>
                    {isLow && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            Low
                        </span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: 'unit_cost',
        header: 'Cost Price',
        cell: ({ row }) => <span className="text-gray-600">KES {Number(row.original.unit_cost).toLocaleString()}</span>
    },
    {
        accessorKey: 'selling_price',
        header: 'Selling Price',
        cell: ({ row }) => <span className="font-medium text-gray-900">KES {Number(row.getValue('selling_price')).toLocaleString()}</span>
    },
]

export default function GaragePartsPage() {
    const [data, setData] = useState<Part[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [partsResult, statsResult] = await Promise.all([
                    fetchParts(),
                    fetchPartsStockSummary().catch(e => null) // Handle potential error gracefully
                ])

                setData(partsResult.results || [])
                setStats(statsResult)
            } catch (error) {
                console.error('Error loading parts:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // Fallback stats if API fails or returns null
    const derivedStats = stats || {
        total_items: data.length,
        low_stock_count: data.filter(p => p.current_stock <= (p.min_stock_level || 0)).length,
        total_value: data.reduce((acc, p) => acc + (Number(p.unit_cost) * p.current_stock), 0)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Parts Inventory
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Manage vehicle parts, stock levels, and pricing
                    </p>
                </div>
                {/* 
                <Link href="/supervisor/garage/parts/add">
                    <Button 
                        className="flex items-center gap-2"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Plus size={16} /> Add Part
                    </Button>
                </Link>
                */}
                <Button disabled variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Part (Coming Soon)
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Parts"
                    value={derivedStats.total_items?.toString() || '0'}
                    icon={Package}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={derivedStats.low_stock_count?.toString() || '0'}
                    icon={AlertTriangle}
                    color="#ef4444" // Red-500
                    trend={derivedStats.low_stock_count > 0 ? { value: 'Action Needed', isPositive: false } : undefined}
                />
                <StatCard
                    title="Total Stock Value"
                    value={`KES ${(derivedStats.total_value || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="#10b981" // Green-500
                />
            </div>

            {/* Inventory Table */}
            <DashboardCard title="Current Inventory" className="min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="name" />
                )}
            </DashboardCard>
        </motion.div>
    )
}
