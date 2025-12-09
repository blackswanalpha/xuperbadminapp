'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Wrench,
    Car,
    AlertTriangle,
    Banknote,
    LayoutDashboard,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchJobCardStatistics, fetchInventoryDashboard } from '@/lib/api'

export default function GarageOverviewPage() {
    const [stats, setStats] = useState<any>(null)
    const [inventoryStats, setInventoryStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [jobStats, invStats] = await Promise.all([
                    fetchJobCardStatistics(),
                    fetchInventoryDashboard()
                ])
                setStats(jobStats)
                setInventoryStats(invStats)
            } catch (error) {
                console.error('Error loading stats:', error)
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    if (loading) {
        return <div className="p-8">Loading garage overview...</div>
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Garage Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Job Cards</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.active_jobs || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Jobs currently in progress
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vehicles In Garage</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryStats?.in_garage_vehicles || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Fleet vehicles undergoing maintenance
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pending_approval || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Jobs awaiting customer/superv. approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Garage Expenses</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {inventoryStats?.monthly_expenses?.toLocaleString() || '0'}</div>
                        <p className="text-xs text-muted-foreground">
                            Parts and external services cost
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Job Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Placeholder for recent activity list - create a separate component later */}
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Job #JC-202312-001 Completed</p>
                                    <p className="text-sm text-muted-foreground">
                                        Toyota Corolla (KBA 123A) - Routine Service
                                    </p>
                                </div>
                                <div className="ml-auto font-medium">Today</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Use Real data later */}
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <div className="ml-2 space-y-1">
                                    <p className="text-sm font-medium leading-none">{inventoryStats?.low_stock_alerts || 0} Low Stock Items</p>
                                    <p className="text-sm text-muted-foreground">
                                        Items below minimum stock level
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
