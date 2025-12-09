'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Car, Tag, Calendar, DollarSign, Edit, Trash2, User } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchVehicleExpense, deleteVehicleExpense, VehicleExpenseItem } from '@/lib/api'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ExpenseDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const [expense, setExpense] = useState<VehicleExpenseItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        const loadExpense = async () => {
            if (!id) return
            try {
                const data = await fetchVehicleExpense(id)
                setExpense(data)
            } catch (error) {
                console.error('Error loading expense:', error)
            } finally {
                setLoading(false)
            }
        }
        loadExpense()
    }, [id])

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        try {
            await deleteVehicleExpense(id)
            router.push('/supervisor/expense-approvals')
        } catch (error) {
            console.error('Error deleting expense:', error)
            alert('Failed to delete expense')
            setDeleting(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center">Loading expense details...</div>
    }

    if (!expense) {
        return <div className="p-8 text-center text-red-500">Expense not found</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-2"
                    >
                        <ArrowLeft size={20} />
                        Back to Expenses
                    </button>
                    <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                        Expense Details
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/supervisor/expense-approvals/${id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                        <Edit size={18} />
                        Edit
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard
                    title="Vehicle & Status"
                    action={
                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                                expense.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                            }`}>
                            {expense.status}
                        </span>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                                <Car size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Vehicle</p>
                                <p className="font-semibold text-lg">{expense.vehicle_registration}</p>
                                <p className="text-gray-600">{expense.vehicle_make} {expense.vehicle_model}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                                <Tag size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Category & Type</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        {expense.category_name}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {expense.type}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                                <User size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Submitted By</p>
                                <p className="font-medium">{expense.supervisor_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                                <Calendar size={20} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date Created</p>
                                <p className="font-medium">{new Date(expense.created_at).toLocaleDateString()} {new Date(expense.created_at).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Financials">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Expense Breakdown</h3>
                            <div className="space-y-3">
                                {expense.items.map((item, index) => {
                                    const cost = expense.item_costs && expense.item_costs[item]
                                        ? expense.item_costs[item]
                                        : 0;
                                    return (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-gray-700">{item}</span>
                                            <span className="font-medium">KSh {Number(cost).toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <span className="font-semibold text-gray-700">Total Amount</span>
                            <span className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                KSh {Number(expense.total_amount).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </DashboardCard>

                {expense.notes && (
                    <div className="md:col-span-2">
                        <DashboardCard title="Notes">
                            <p className="text-gray-700 whitespace-pre-wrap">{expense.notes}</p>
                        </DashboardCard>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
