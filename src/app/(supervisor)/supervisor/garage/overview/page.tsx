'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Wrench,
    Car,
    AlertTriangle,
    Banknote,
    Activity,
    ArrowRight,
} from 'lucide-react'
import {
    fetchJobCardStatistics,
    fetchInventoryDashboard,
    fetchLowStockParts,
    fetchRecentActivities,
    InventoryDashboardMetrics,
    Part,
    Activity as ActivityType
} from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts'
import { useRouter } from 'next/navigation'

export default function GarageOverviewPage() {
    const router = useRouter()
    const [stats, setStats] = useState<{ active_jobs: number; pending_approval: number } | null>(null)
    const [inventoryStats, setInventoryStats] = useState<InventoryDashboardMetrics | null>(null)
    const [lowStockParts, setLowStockParts] = useState<Part[]>([])
    const [activities, setActivities] = useState<ActivityType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadGivenData = async () => {
            try {
                const [jobStats, invStats, lowStock, recentActivity] = await Promise.all([
                    fetchJobCardStatistics(),
                    fetchInventoryDashboard(),
                    fetchLowStockParts(),
                    fetchRecentActivities()
                ])
                setStats(jobStats)
                setInventoryStats(invStats)
                setLowStockParts(lowStock)
                setActivities(recentActivity.activities || [])
            } catch (error) {
                console.error('Error loading garage stats:', error)
            } finally {
                setLoading(false)
            }
        }

        loadGivenData()
    }, [])

    const COLORS = [colors.supervisorPrimary, '#FFBB28', '#FF8042', '#00C49F']

    // Prepare chart data
    const vehicleStatusData = inventoryStats ? [
        { name: 'Available', value: inventoryStats.available_vehicles || 0 },
        { name: 'Hired', value: inventoryStats.hired_vehicles || 0 },
        { name: 'In Garage', value: inventoryStats.in_garage_vehicles || 0 },
    ] : []

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Garage Overview
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Real-time fleet maintenance and inventory status
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/supervisor/garage/job-cards')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Wrench size={18} />
                        View Job Cards
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Job Cards"
                    value={stats?.active_jobs || 0}
                    icon={Wrench}
                    color={colors.supervisorPrimary}
                    onClick={() => router.push('/supervisor/garage/job-cards?status=in_progress')}
                />
                <StatCard
                    title="Vehicles In Garage"
                    value={inventoryStats?.in_garage_vehicles || 0}
                    icon={Car}
                    color="#f97316" // Orange-500
                    onClick={() => router.push('/supervisor/garage/vehicles')}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={inventoryStats?.low_stock_alerts || 0}
                    icon={AlertTriangle}
                    color="#ef4444" // Red-500
                    onClick={() => router.push('/supervisor/garage/parts?filter=low_stock')}
                />
                <StatCard
                    title="Monthly Expenses"
                    value={`KES ${inventoryStats?.monthly_expenses?.toLocaleString() || '0'}`}
                    icon={Banknote}
                    color="#22c55e" // Green-500
                />
            </div>

            {/* Main Content Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    <DashboardCard title="Vehicle Status Distribution" subtitle="Fleet availability overview">
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={vehicleStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {vehicleStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Low Stock Alerts" subtitle="Items requiring immediate attention">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left">
                                        <th className="pb-3 text-sm font-medium text-gray-500">Part Name</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">SKU</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Stock</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Min Level</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockParts.length > 0 ? (
                                        lowStockParts.slice(0, 5).map((part) => (
                                            <tr key={part.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="py-3 text-sm font-medium text-gray-900">{part.name}</td>
                                                <td className="py-3 text-sm text-gray-500">{part.sku}</td>
                                                <td className="py-3 text-sm text-red-600 font-medium">{part.current_stock} {part.unit}</td>
                                                <td className="py-3 text-sm text-gray-400">{part.min_stock_level}</td>
                                                <td className="py-3">
                                                    <button
                                                        onClick={() => router.push(`/supervisor/garage/parts/${part.id}`)}
                                                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                    >
                                                        Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">
                                                No low stock items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {lowStockParts.length > 5 && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => router.push('/supervisor/garage/parts?filter=low_stock')}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View All Alerts
                                    </button>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-8">
                    <DashboardCard title="Recent Activity" subtitle="Latest garage updates">
                        <div className="space-y-6">
                            {activities.length > 0 ? (
                                activities.slice(0, 6).map((activity) => (
                                    <div key={activity.id} className="flex gap-4">
                                        <div className={`mt-1 p-2 rounded-full h-8 w-8 flex items-center justify-center bg-gray-50`}>
                                            <Activity size={14} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{activity.subtitle}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    No recent activity
                                </div>
                            )}
                        </div>
                    </DashboardCard>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Pending Approvals</h3>
                            <p className="text-blue-100 mb-6 text-sm">
                                You have {stats?.pending_approval || 0} job cards waiting for your approval.
                            </p>
                            <button
                                onClick={() => router.push('/supervisor/garage/job-cards?status=pending_approval')}
                                className="w-full py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                Review Now <ArrowRight size={16} />
                            </button>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-500 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-blue-700 opacity-50"></div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}
