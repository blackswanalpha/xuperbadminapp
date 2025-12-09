'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Car,
    MapPin,
    Calendar,
    DollarSign,
    Wrench,
    Package,
    TrendingUp,
    Edit,
    ArrowLeft,
    Activity,
    AlertCircle,
    CheckCircle,
    Plus
} from 'lucide-react'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import {
    fetchVehicleDetailedInfo,
    fetchVehicleMaintenance,
    fetchStockUsageByVehicle,
    MaintenanceRecord,
    StockUsage
} from '@/lib/api'

type Tab = 'overview' | 'maintenance' | 'stock-usage' | 'analysis'

export default function FleetDetailPage() {
    const params = useParams()
    const router = useRouter()
    const vehicleId = params.id as string

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<Tab>('overview')
    const [vehicleData, setVehicleData] = useState<any>(null)
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
    const [stockUsage, setStockUsage] = useState<StockUsage[]>([])

    useEffect(() => {
        loadVehicleData()
    }, [vehicleId])

    const loadVehicleData = async () => {
        try {
            setLoading(true)
            const [detailData, maintenance, stock] = await Promise.all([
                fetchVehicleDetailedInfo(parseInt(vehicleId)),
                fetchVehicleMaintenance(parseInt(vehicleId)),
                fetchStockUsageByVehicle(parseInt(vehicleId))
            ])

            setVehicleData(detailData)
            setMaintenanceRecords(maintenance)
            setStockUsage(stock)
        } catch (error) {
            console.error('Error loading vehicle data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!vehicleData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Vehicle not found</p>
            </div>
        )
    }

    const vehicle = vehicleData.vehicle_info
    const analytics = vehicleData.analytics || {}

    // Calculate vehicle health score
    const calculateHealthScore = () => {
        let score = 100
        if (vehicle.condition === 'POOR') score -= 40
        else if (vehicle.condition === 'FAIR') score -= 20
        else if (vehicle.condition === 'GOOD') score -= 10

        const overdueRecords = maintenanceRecords.filter((r: any) => r.status === 'scheduled' && new Date(r.scheduled_date) < new Date())
        score -= overdueRecords.length * 5

        return Math.max(0, Math.min(100, score))
    }

    const healthScore = calculateHealthScore()

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Car },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'stock-usage', label: 'Stock Usage', icon: Package },
        { id: 'analysis', label: 'Analysis', icon: TrendingUp }
    ]

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'EXCELLENT': return 'bg-green-100 text-green-800'
            case 'GOOD': return 'bg-blue-100 text-blue-800'
            case 'FAIR': return 'bg-yellow-100 text-yellow-800'
            case 'POOR': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getHealthScoreColor = (score: number) => {
        if (score >= 80) return colors.supervisorAccent
        if (score >= 60) return colors.supervisorPrimaryLight
        if (score >= 40) return '#f59e0b'
        return colors.adminError
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            {vehicle.vehicle?.registration_number || 'N/A'}
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            {vehicle.vehicle?.make} {vehicle.vehicle?.model}
                        </p>
                    </div>
                </div>
                <Link
                    href={`/supervisor/fleet-monitoring/${vehicleId}/edit`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                    style={{ backgroundColor: colors.supervisorPrimary }}
                >
                    <Edit size={20} />
                    Edit
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Vehicle Health"
                    value={`${healthScore}%`}
                    icon={Activity}
                    trend={{ value: '', isPositive: healthScore >= 70 }}
                    color={getHealthScoreColor(healthScore)}
                />
                <StatCard
                    title="Total Revenue"
                    value={`KES ${(analytics.total_revenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: '', isPositive: true }}
                    color={colors.supervisorAccent}
                />
                <StatCard
                    title="Total Contracts"
                    value={analytics.total_contracts || 0}
                    icon={CheckCircle}
                    trend={{ value: '', isPositive: true }}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Maintenance Cost"
                    value={`KES ${parseFloat(vehicle.maintenance_cost || 0).toLocaleString()}`}
                    icon={Wrench}
                    trend={{ value: '', isPositive: false }}
                    color={colors.adminError}
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <div className="flex gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && <OverviewTab vehicle={vehicle} />}
                    {activeTab === 'maintenance' && <MaintenanceTab records={maintenanceRecords} vehicleId={vehicleId} />}
                    {activeTab === 'stock-usage' && <StockUsageTab usage={stockUsage} />}
                    {activeTab === 'analysis' && (
                        <AnalysisTab
                            vehicle={vehicle}
                            analytics={analytics}
                            healthScore={healthScore}
                            maintenanceRecords={maintenanceRecords}
                            stockUsage={stockUsage}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}

// Overview Tab Component
function OverviewTab({ vehicle }: { vehicle: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Vehicle Information" subtitle="Basic details">
                <div className="space-y-4">
                    <InfoRow label="Registration" value={vehicle.vehicle?.registration_number || 'N/A'} />
                    <InfoRow label="Make & Model" value={`${vehicle.vehicle?.make || 'N/A'} ${vehicle.vehicle?.model || 'N/A'}`} />
                    <InfoRow label="Color" value={vehicle.vehicle?.color || 'N/A'} />
                    <InfoRow label="Type" value={vehicle.vehicle?.vehicle_type || 'N/A'} />
                    <InfoRow
                        label="Condition"
                        value={
                            <span className={`px-3 py-1 rounded-full text-xs font-medium`} style={{
                                backgroundColor: vehicle.condition === 'EXCELLENT' ? '#dcfce7' :
                                    vehicle.condition === 'GOOD' ? '#dbeafe' :
                                        vehicle.condition === 'FAIR' ? '#fef3c7' : '#fee2e2',
                                color: vehicle.condition === 'EXCELLENT' ? '#166534' :
                                    vehicle.condition === 'GOOD' ? '#1e40af' :
                                        vehicle.condition === 'FAIR' ? '#92400e' : '#991b1b'
                            }}>
                                {vehicle.condition}
                            </span>
                        }
                    />
                </div>
            </DashboardCard>

            <DashboardCard title="Location & Status" subtitle="Current status">
                <div className="space-y-4">
                    <InfoRow label="Current Location" value={vehicle.location || 'Not set'} icon={MapPin} />
                    <InfoRow
                        label="Last Inspection"
                        value={vehicle.last_inspection ? new Date(vehicle.last_inspection).toLocaleDateString() : 'N/A'}
                        icon={Calendar}
                    />
                    <InfoRow
                        label="Next Inspection"
                        value={vehicle.next_inspection ? new Date(vehicle.next_inspection).toLocaleDateString() : 'N/A'}
                        icon={Calendar}
                    />
                </div>
            </DashboardCard>

            <DashboardCard title="Financial Details" subtitle="Purchase & valuation">
                <div className="space-y-4">
                    <InfoRow
                        label="Purchase Date"
                        value={vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString() : 'N/A'}
                    />
                    <InfoRow
                        label="Purchase Price"
                        value={vehicle.purchase_price ? `KES ${parseFloat(vehicle.purchase_price).toLocaleString()}` : 'N/A'}
                    />
                    <InfoRow
                        label="Current Value"
                        value={vehicle.current_value ? `KES ${parseFloat(vehicle.current_value).toLocaleString()}` : 'N/A'}
                    />
                    <InfoRow
                        label="Maintenance Cost"
                        value={vehicle.maintenance_cost ? `KES ${parseFloat(vehicle.maintenance_cost).toLocaleString()}` : 'N/A'}
                    />
                </div>
            </DashboardCard>
        </div>
    )
}

// Maintenance Tab Component
function MaintenanceTab({ records, vehicleId }: { records: MaintenanceRecord[], vehicleId: string }) {
    const totalCost = records.reduce((sum, r) => sum + parseFloat(r.cost || '0'), 0)
    const upcoming = records.filter(r => r.status === 'scheduled')
    const completed = records.filter(r => r.status === 'completed')

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Total Maintenance Cost</p>
                    <p className="text-2xl font-bold">KES {totalCost.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Upcoming</p>
                    <p className="text-2xl font-bold">{upcoming.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Completed</p>
                    <p className="text-2xl font-bold">{completed.length}</p>
                </div>
            </div>

            <DashboardCard
                title="Maintenance History"
                subtitle="All maintenance records"
                action={
                    <Link
                        href={`/supervisor/fleet-monitoring/${vehicleId}/add-maintenance`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Plus size={20} />
                        Add Maintenance
                    </Link>
                }
            >
                {records.length === 0 ? (
                    <div className="text-center py-12">
                        <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No maintenance records found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {records.map((record) => (
                            <Link key={record.id} href={`/supervisor/fleet-monitoring/${vehicleId}/maintenance/${record.id}`}>
                                <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">{record.maintenance_type.replace('_', ' ').toUpperCase()}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {record.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">
                                            {new Date(record.scheduled_date).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold">KES {parseFloat(record.cost).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </DashboardCard>
        </div>
    )
}

// Stock Usage Tab Component
function StockUsageTab({ usage }: { usage: StockUsage[] }) {
    const totalCost = usage.reduce((sum, u) => sum + ((u.part as any)?.unit_cost ? parseFloat((u.part as any).unit_cost) * ((u as any).quantity || 0) : 0), 0)

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Total Parts Used</p>
                    <p className="text-2xl font-bold">{usage.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Total Parts Cost</p>
                    <p className="text-2xl font-bold">KES {totalCost.toLocaleString()}</p>
                </div>
            </div>

            <DashboardCard title="Usage History" subtitle="Parts used on this vehicle">
                {usage.length === 0 ? (
                    <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No stock usage records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Part</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usage.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">{(item.part as any)?.name || 'N/A'}</td>
                                        <td className="py-3 px-4">{(item as any).quantity}</td>
                                        <td className="py-3 px-4">{new Date((item as any).usage_date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-semibold">
                                            KES {(item.part as any)?.unit_cost ? (parseFloat((item.part as any).unit_cost) * (item as any).quantity).toLocaleString() : 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardCard>
        </div>
    )
}

// Analysis Tab Component
function AnalysisTab({ vehicle, analytics, healthScore, maintenanceRecords, stockUsage }: any) {
    const totalRevenue = analytics.total_revenue || 0
    const totalMaintenanceCost = maintenanceRecords.reduce((sum: number, r: any) => sum + parseFloat(r.cost || '0'), 0)
    const totalPartsCost = stockUsage.reduce((sum: number, u: any) => sum + (u.part?.unit_cost ? parseFloat(u.part.unit_cost) * u.quantity : 0), 0)
    const totalCost = totalMaintenanceCost + totalPartsCost
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1) : 0

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: healthScore >= 70 ? colors.supervisorAccent : colors.adminError }}>
                    <p className="text-sm text-gray-600 mb-2">Vehicle Health Score</p>
                    <p className="text-3xl font-bold" style={{ color: healthScore >= 70 ? colors.supervisorAccent : colors.adminError }}>
                        {healthScore}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Poor'}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Utilization Rate</p>
                    <p className="text-3xl font-bold">{analytics.utilization_rate || 0}%</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Avg Rental Duration</p>
                    <p className="text-3xl font-bold">{analytics.avg_rental_duration || 0} days</p>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Profit Margin</p>
                    <p className="text-3xl font-bold">{profitMargin}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Cost Breakdown" subtitle="Revenue vs Expenses">
                    <div className="space-y-4">
                        <CostRow label="Total Revenue" value={totalRevenue} color={colors.supervisorAccent} />
                        <CostRow label="Maintenance Cost" value={totalMaintenanceCost} color={colors.adminError} />
                        <CostRow label="Parts Cost" value={totalPartsCost} color={colors.supervisorPrimaryLight} />
                        <div className="border-t pt-4 mt-4">
                            <CostRow
                                label="Net Profit"
                                value={totalRevenue - totalCost}
                                color={totalRevenue - totalCost >= 0 ? colors.supervisorAccent : colors.adminError}
                                bold
                            />
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Performance Metrics" subtitle="Key indicators">
                    <div className="space-y-4">
                        <InfoRow label="Total Contracts" value={analytics.total_contracts || 0} />
                        <InfoRow label="Active Contracts" value={analytics.active_contracts || 0} />
                        <InfoRow label="Completed Contracts" value={analytics.completed_contracts || 0} />
                        <InfoRow label="Monthly Bookings" value={analytics.monthly_bookings || 0} />
                    </div>
                </DashboardCard>
            </div>
        </div>
    )
}

// Helper Components
function InfoRow({ label, value, icon: Icon }: { label: string; value: any; icon?: any }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
                {Icon && <Icon size={16} className="text-gray-400" />}
                <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-medium">{value}</span>
        </div>
    )
}

function CostRow({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2">
            <span className={`text-sm ${bold ? 'font-semibold' : 'text-gray-600'}`}>{label}</span>
            <span className={`${bold ? 'text-lg font-bold' : 'font-semibold'}`} style={{ color }}>
                KES {value.toLocaleString()}
            </span>
        </div>
    )
}
