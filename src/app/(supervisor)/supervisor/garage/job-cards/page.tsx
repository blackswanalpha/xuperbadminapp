'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Wrench,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    FileText,
    MoreHorizontal,
    Calendar,
    User,
    Car,
    Filter,
    Download
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchJobCards, JobCard } from '@/lib/api'
import { colors } from '@/lib/theme/colors'
import DashboardCard from '@/components/shared/dashboard-card'

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
}

export default function JobCardsPage() {
    const router = useRouter()
    const [data, setData] = useState<JobCard[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        unpaid: 0
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await fetchJobCards()
                setData(result)

                // Calculate stats
                setStats({
                    total: result.length,
                    inProgress: result.filter(j => j.status === 'in_progress' || j.status === 'started').length,
                    completed: result.filter(j => j.status === 'completed').length,
                    unpaid: result.filter(j => j.payment_status === 'pending' || j.payment_status === 'unpaid').length
                })
            } catch (error) {
                console.error('Error loading job cards:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const filteredData = data.filter(item => {
        const matchesSearch =
            item.job_card_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.registration_number.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

        return matchesSearch && matchesStatus;
    })

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center flex-col">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Wrench className="h-12 w-12 text-blue-600/50" />
                </motion.div>
                <div className="text-gray-500 mt-4 animate-pulse">Loading Job Cards...</div>
            </div>
        )
    }

    return (
        <motion.div
            className="flex-1 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Job Cards
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                        Manage garage work orders, track status, and payments.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/supervisor/garage/job-cards/add"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Plus size={18} />
                        New Job Card
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                variants={itemVariants}
            >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText size={64} className="text-blue-600" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                            <FileText size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    <p className="text-xs text-gray-400 mt-1">All time records</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wrench size={64} className="text-indigo-600" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                            <Wrench size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.inProgress}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> Active now
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-100">
                        <div className="h-full bg-indigo-600" style={{ width: `${(stats.inProgress / (stats.total || 1)) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CheckCircle2 size={64} className="text-green-600" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-green-50 text-green-600">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
                    <p className="text-xs text-gray-400 mt-1">Finished jobs</p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-green-100">
                        <div className="h-full bg-green-600" style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertCircle size={64} className="text-red-600" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-red-50 text-red-600">
                            <AlertCircle size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Pending Payment</h3>
                    <p className="text-2xl font-bold text-red-500 mt-1">{stats.unpaid}</p>
                    <p className="text-xs text-gray-400 mt-1">Require action</p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-red-100">
                        <div className="h-full bg-red-500" style={{ width: `${(stats.unpaid / (stats.total || 1)) * 100}%` }}></div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <DashboardCard title="Recent Work Orders" subtitle="A list of all job cards and their current status">
                    {/* Filters and Search */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search job cards, clients, or vehicles..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
                            {['all', 'in_progress', 'completed', 'pending'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterStatus === status
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {status === 'all' ? 'All Jobs' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-left">
                                    <th className="pb-4 pl-4 text-sm font-medium text-gray-500">Job Card #</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500">Date</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500">Client</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500">Vehicle</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500">Payment</th>
                                    <th className="pb-4 pr-4 text-right text-sm font-medium text-gray-500">Total Value</th>
                                    <th className="pb-4 text-sm font-medium text-gray-500"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((job) => (
                                        <tr
                                            key={job.id}
                                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/supervisor/garage/job-cards/${job.id}`)}
                                        >
                                            <td className="py-4 pl-4 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                                                {job.job_card_number}
                                            </td>
                                            <td className="py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {new Date(job.date_created).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-900 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    {job.client_name}
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 flex items-center gap-2">
                                                        <Car size={14} className="text-gray-400" />
                                                        {job.registration_number}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-6">
                                                        {job.make} {job.model}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${job.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        job.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            job.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {job.status === 'completed' && <CheckCircle2 size={12} />}
                                                    {job.status === 'in_progress' && <Wrench size={12} />}
                                                    {job.status === 'pending' && <Clock size={12} />}
                                                    <span className="capitalize">{job.status.replace('_', ' ')}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${job.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        job.payment_status === 'partial' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {job.payment_status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 text-sm font-mono font-medium text-right text-gray-900">
                                                KES {Number(job.total_job_value).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-center">
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-50 p-4 rounded-full mb-3">
                                                    <Search size={24} className="text-gray-400" />
                                                </div>
                                                <p className="font-medium">No job cards found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </DashboardCard>
            </motion.div>
        </motion.div>
    )
}
