'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Wrench,
    AlertTriangle,
    TrendingUp,
    Clock,
    FileText,
    BarChart3,
    Activity,
    MapPin,
    User
} from 'lucide-react'
import Link from 'next/link'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'
import StatCard from '@/components/shared/stat-card'
import DashboardCard from '@/components/shared/dashboard-card'
import { fetchJobCards } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

interface JobCard {
    id: number
    registration_number: string
    client_name: string
    client_phone?: string
    make?: string
    model?: string
    defects?: string
    repairs?: string
    job_cost?: number
    status: string
    date_created: string
    mechanic_status?: string
    parts_used?: any[]
}

interface VehicleHistoryData {
    registration_number: string
    make: string
    model: string
    client_name: string
    client_phone: string
    total_visits: number
    total_cost: number
    last_service_date: string
    job_cards: JobCard[]
    status_breakdown: { [key: string]: number }
    monthly_costs: { month: string, cost: number }[]
    common_issues: { issue: string, count: number }[]
}

export default function VehicleHistoryPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const id = params.id as string
    const [loading, setLoading] = useState(true)
    const [vehicleData, setVehicleData] = useState<VehicleHistoryData | null>(null)

    useEffect(() => {
        const loadVehicleHistory = async () => {
            try {
                // The 'id' in the URL is actually the registration number passed from the details page
                const registration = id;
                const jobCardsResponse = await fetchJobCards(1, 1000, { registration_number: registration });
                const vehicleJobCards = jobCardsResponse.results || [];

                if (vehicleJobCards.length === 0) {
                    setVehicleData(null)
                    return
                }

                // Get vehicle info from the latest job card
                const latestJob = vehicleJobCards[0]

                // Calculate analytics
                const totalCost = vehicleJobCards.reduce((sum, job) =>
                    sum + (Number(job.job_cost || 0) || 0), 0
                )

                // Status breakdown
                const statusBreakdown = vehicleJobCards.reduce((acc, job) => {
                    acc[job.status] = (acc[job.status] || 0) + 1
                    return acc
                }, {} as { [key: string]: number })

                // Monthly costs (last 12 months)
                const monthlyCosts = calculateMonthlyCosts(vehicleJobCards)

                // Common issues analysis
                const commonIssues = analyzeCommonIssues(vehicleJobCards)

                const historyData: VehicleHistoryData = {
                    registration_number: registration,
                    make: latestJob.make || 'Unknown',
                    model: latestJob.model || 'Unknown',
                    client_name: latestJob.client_name,
                    client_phone: latestJob.client_phone || '',
                    total_visits: vehicleJobCards.length,
                    total_cost: totalCost,
                    last_service_date: latestJob.date_created,
                    job_cards: vehicleJobCards,
                    status_breakdown: statusBreakdown,
                    monthly_costs: monthlyCosts,
                    common_issues: commonIssues
                }

                setVehicleData(historyData)
            } catch (error) {
                console.error('Error loading vehicle history:', error)
                toast({
                    title: "Error",
                    description: "Failed to load vehicle history. Please try again.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        loadVehicleHistory()
    }, [registration, toast])

    const calculateMonthlyCosts = (jobCards: JobCard[]) => {
        const monthlyData: { [key: string]: number } = {}
        const last12Months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            return date.toISOString().slice(0, 7) // YYYY-MM format
        }).reverse()

        last12Months.forEach(month => {
            monthlyData[month] = 0
        })

        jobCards.forEach(job => {
            const jobMonth = job.date_created.slice(0, 7)
            const cost = Number(job.job_cost || 0) || 0
            if (monthlyData.hasOwnProperty(jobMonth)) {
                monthlyData[jobMonth] += cost
            }
        })

        return last12Months.map(month => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            cost: monthlyData[month]
        }))
    }

    const analyzeCommonIssues = (jobCards: JobCard[]) => {
        const issues: { [key: string]: number } = {}

        jobCards.forEach(job => {
            const defects = job.defects?.toLowerCase() || ''
            const repairs = job.repairs?.toLowerCase() || ''
            const combined = `${defects} ${repairs}`

            // Simple keyword extraction
            const keywords = ['brake', 'engine', 'tire', 'oil', 'battery', 'lights', 'suspension', 'transmission']
            keywords.forEach(keyword => {
                if (combined.includes(keyword)) {
                    issues[keyword] = (issues[keyword] || 0) + 1
                }
            })
        })

        return Object.entries(issues)
            .map(([issue, count]) => ({ issue: issue.charAt(0).toUpperCase() + issue.slice(1), count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
    }

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!vehicleData) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 space-y-4 p-4 md:p-8 pt-6"
            >
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Vehicle History</h2>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Service History</h3>
                        <p className="text-gray-500">No job cards found for vehicle {registration}</p>
                        <Link href="/supervisor/garage/vehicles" className="mt-4 inline-block">
                            <Button variant="outline">Back to Vehicles</Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6 p-4 md:p-8 pt-6"
        >
            {/* Header */}
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                        {vehicleData.registration_number}
                    </h2>
                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                        <span>{vehicleData.make} {vehicleData.model}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <User size={14} />
                            {vehicleData.client_name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Service Visits"
                    value={vehicleData.total_visits.toString()}
                    icon={Activity}
                    color={colors.supervisorPrimary}
                />
                <StatCard
                    title="Total Service Cost"
                    value={`KES ${vehicleData.total_cost.toLocaleString()}`}
                    icon={DollarSign}
                    color="#10b981"
                />
                <StatCard
                    title="Last Service"
                    value={new Date(vehicleData.last_service_date).toLocaleDateString()}
                    icon={Calendar}
                    color="#3b82f6"
                />
                <StatCard
                    title="Avg. Cost per Visit"
                    value={`KES ${Math.round(vehicleData.total_cost / vehicleData.total_visits).toLocaleString()}`}
                    icon={TrendingUp}
                    color="#f59e0b"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="timeline" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="timeline">Service Timeline</TabsTrigger>
                    <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
                    <TabsTrigger value="issues">Common Issues</TabsTrigger>
                    <TabsTrigger value="details">Service Details</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline">
                    <DashboardCard title="Service Timeline" className="min-h-[500px]">
                        <div className="space-y-6">
                            {vehicleData.job_cards.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 border-l-2 border-gray-200 pl-4 pb-6"
                                >
                                    <div
                                        className="flex-shrink-0 w-3 h-3 rounded-full mt-2 -ml-6 border-2 border-white"
                                        style={{ backgroundColor: colors.supervisorPrimary }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                                                    Job Card #{job.id}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                                                    <Calendar size={14} />
                                                    <span>{new Date(job.date_created).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold" style={{ color: colors.textPrimary }}>
                                                    KES {Number(job.job_cost || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        {job.defects && (
                                            <div className="mb-2">
                                                <h4 className="text-sm font-medium text-gray-600 mb-1">Defects Reported:</h4>
                                                <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">{job.defects}</p>
                                            </div>
                                        )}
                                        {job.repairs && (
                                            <div className="mb-2">
                                                <h4 className="text-sm font-medium text-gray-600 mb-1">Repairs Done:</h4>
                                                <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">{job.repairs}</p>
                                            </div>
                                        )}
                                        <Link href={`/supervisor/garage/job-cards/${job.id}`}>
                                            <Button size="sm" variant="outline" className="mt-2">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </DashboardCard>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard title="Monthly Service Costs">
                            <div className="space-y-4">
                                {vehicleData.monthly_costs.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{item.month}</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-600"
                                                style={{
                                                    width: `${Math.max(5, (item.cost / Math.max(...vehicleData.monthly_costs.map(m => m.cost))) * 100)}%`,
                                                    minWidth: '20px'
                                                }}
                                            />
                                            <span className="text-sm font-semibold">KES {item.cost.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Service Status Breakdown">
                            <div className="space-y-4">
                                {Object.entries(vehicleData.status_breakdown).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${(count / vehicleData.total_visits) * 100}%`,
                                                    backgroundColor: status === 'completed' ? colors.supervisorPrimary :
                                                        status === 'in_progress' ? '#3b82f6' : '#f59e0b',
                                                    minWidth: '20px'
                                                }}
                                            />
                                            <span className="text-sm font-semibold">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>
                    </div>
                </TabsContent>

                <TabsContent value="issues">
                    <DashboardCard title="Most Common Issues">
                        <div className="space-y-4">
                            {vehicleData.common_issues.length > 0 ? (
                                vehicleData.common_issues.map((issue, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={16} className="text-yellow-600" />
                                            <span className="font-medium">{issue.issue} Issues</span>
                                        </div>
                                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            {issue.count} occurrences
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Wrench size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No common issues detected</p>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </TabsContent>

                <TabsContent value="details">
                    <DashboardCard title="Detailed Service Records">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Date</th>
                                        <th className="text-left p-2">Job Card #</th>
                                        <th className="text-left p-2">Status</th>
                                        <th className="text-left p-2">Cost</th>
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicleData.job_cards.map((job) => (
                                        <tr key={job.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">{new Date(job.date_created).toLocaleDateString()}</td>
                                            <td className="p-2">#{job.id}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="p-2">KES {Number(job.job_cost || 0).toLocaleString()}</td>
                                            <td className="p-2">
                                                <Link href={`/supervisor/garage/job-cards/${job.id}`}>
                                                    <Button size="sm" variant="outline">View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardCard>
                </TabsContent>
            </Tabs>
        </motion.div>
    )
}