
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    fetchSupplier,
    fetchSupplierItems,
    fetchSupplierPayables,
    fetchSupplierPayments
} from '@/lib/api'
import {
    Supplier,
    SupplierItem,
    AccountsPayable,
    SupplierPayment
} from '@/types/supplier'
import { colors } from '@/lib/theme/colors'
import {
    ArrowLeft,
    Building,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    Package,
    Calendar,
    DollarSign,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink,
    Edit,
    Settings
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'

export default function SupplierDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [supplier, setSupplier] = useState<Supplier | null>(null)
    const [items, setItems] = useState<SupplierItem[]>([])
    const [payables, setPayables] = useState<AccountsPayable[]>([])
    const [payments, setPayments] = useState<SupplierPayment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (id) {
            loadData()
        }
    }, [id])

    const loadData = async () => {
        try {
            setLoading(true)
            const [supplierData, itemsData, payablesData, paymentsData] = await Promise.all([
                fetchSupplier(id),
                fetchSupplierItems(id),
                fetchSupplierPayables(id),
                fetchSupplierPayments(id)
            ])

            setSupplier(supplierData)
            setItems(itemsData)
            setPayables(payablesData)
            setPayments(paymentsData)
        } catch (err) {
            setError('Failed to load supplier details')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number | string) => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(val)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading supplier details...</div>
            </div>
        )
    }

    if (error || !supplier) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-red-500">{error || 'Supplier not found'}</div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Go Back
                </button>
            </div>
        )
    }

    // Calculate stats
    const totalPurchases = items.reduce((sum, item) => sum + Number(item.purchase_price || 0), 0)
    const totalOutstanding = payables
        .filter(p => ['UNPAID', 'PARTIAL', 'OVERDUE'].includes(p.status))
        .reduce((sum, p) => sum + (Number(p.amount) - Number(p.amount_paid)), 0)
    const vehicleCount = items.filter(i => i.item_type === 'VEHICLE').length
    const partCount = items.filter(i => i.item_type === 'PART').length

    const stats = [
        {
            title: 'Total Purchases',
            value: formatCurrency(totalPurchases),
            icon: DollarSign,
            color: colors.adminPrimary,
            trend: { value: `${items.length} items`, isPositive: true }
        },
        {
            title: 'Outstanding Balance',
            value: formatCurrency(totalOutstanding),
            icon: CreditCard,
            color: totalOutstanding > 0 ? colors.adminWarning : colors.adminSuccess,
            trend: {
                value: totalOutstanding > 0 ? 'Payable' : 'Settled',
                isPositive: totalOutstanding === 0
            }
        },
        {
            title: 'Vehicles Supplied',
            value: vehicleCount.toString(),
            icon: Package,
            color: colors.adminAccent,
        },
        {
            title: 'Parts Supplied',
            value: partCount.toString(),
            icon: Settings,
            color: colors.supervisorSecondary,
        }
    ]



    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-white border hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.borderLight }}
                    >
                        <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: colors.textPrimary }}>
                            {supplier.name}
                            <span className={`px-2 py-1 text-xs rounded-full ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {supplier.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </h1>
                        <p className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                            <span className="font-mono">{supplier.supplier_code}</span>
                            {supplier.tax_id && (
                                <>
                                    <span>•</span>
                                    <span>Tax ID: {supplier.tax_id}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => {/* Handle edit */ }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.adminPrimary }}
                >
                    <Edit size={18} />
                    Edit Supplier
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: colors.borderLight }}>
                <div className="border-b px-6 flex gap-8" style={{ borderColor: colors.borderLight }}>
                    {['overview', 'items', 'payables', 'payments'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-[color:var(--active-color)] text-[color:var(--active-color)]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            style={{
                                ['--active-color' as any]: colors.adminPrimary
                            }}
                        >
                            {tab === 'items' ? 'Items Purchased' : tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                        <div className="p-2 rounded-full bg-white shadow-sm text-blue-500">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="font-medium text-gray-900">{supplier.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                        <div className="p-2 rounded-full bg-white shadow-sm text-blue-500">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium text-gray-900">{supplier.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                        <div className="p-2 rounded-full bg-white shadow-sm text-blue-500">
                                            <Building size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact Person</p>
                                            <p className="font-medium text-gray-900">{supplier.contact_person || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                                        <div className="p-2 rounded-full bg-white shadow-sm text-blue-500">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium text-gray-900">{supplier.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Recent Activity</h3>
                                <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                                    <Clock className="mx-auto mb-2 text-gray-400" size={32} />
                                    <p>No recent activity logs available</p>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Item Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Purchase Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Reference</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-500">Price</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-gray-500">No items purchased yet</td>
                                        </tr>
                                    ) : items.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.item_name}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    {item.item_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.purchase_date)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600 font-mono">{item.item_reference || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(item.purchase_price)}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.payment_status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        item.payment_status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.payment_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payables' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Invoice #</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Due Date</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-500">Amount</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-500">Paid</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-500">Balance</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payables.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-gray-500">No invoices recorded</td>
                                        </tr>
                                    ) : payables.map((payable) => {
                                        const balance = Number(payable.amount) - Number(payable.amount_paid)
                                        return (
                                            <tr key={payable.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{payable.invoice_number}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(payable.invoice_date)}</td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(payable.due_date)}</td>
                                                <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(payable.amount)}</td>
                                                <td className="py-3 px-4 text-sm text-right text-gray-600">{formatCurrency(payable.amount_paid)}</td>
                                                <td className="py-3 px-4 text-sm text-right font-medium text-red-600">{formatCurrency(balance)}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payable.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                            payable.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                                payable.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {payable.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Reference #</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Payment Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Method</th>
                                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-500">Amount</th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-500">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500">No payments recorded</td>
                                        </tr>
                                    ) : payments.map((payment) => (
                                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{payment.reference_number || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{formatDate(payment.payment_date)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-600">{payment.payment_method.replace('_', ' ')}</td>
                                            <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(payment.amount)}</td>
                                            <td className="py-3 px-4 text-sm text-gray-500 truncate max-w-xs">{payment.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
