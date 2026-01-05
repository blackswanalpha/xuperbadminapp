'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    X,
    Plus
} from 'lucide-react'
import { createJobCard } from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'

// Helper component for form fields
const FormField = ({ label, id, children, required }: any) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium flex" style={{ color: colors.textPrimary }}>
            {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
    </div>
)

const Input = ({ ...props }: any) => (
    <input
        className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
        style={{
            borderColor: colors.borderLight,
            color: colors.textPrimary
        }}
        {...props}
    />
)

const Select = ({ children, ...props }: any) => (
    <div className="relative">
        <select
            className="flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all"
            style={{
                borderColor: colors.borderLight,
                color: colors.textPrimary
            }}
            {...props}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4" style={{ color: colors.textTertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
)

export default function AddJobCardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        client_name: '',
        client_phone: '',
        client_email: '',
        registration_number: '',
        make: '',
        model: '',
        speedometer_reading: '',
        fuel_tank_level: '',
        estimated_cost: 0,
        status: 'in_progress',
        payment_status: 'pending'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            await createJobCard(formData)
            setSuccess(true)
            // Redirect after short delay to show success message
            setTimeout(() => {
                router.push('/admin/garage-management')
            }, 1000)
        } catch (error) {
            console.error('Error creating job card:', error)
            setError('Failed to create Job Card. Please check your inputs and try again.')
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft style={{ color: colors.textSecondary }} size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            New Job Card
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            Create a new service job card
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                        style={{ backgroundColor: colors.adminPrimary }}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {loading ? 'Creating...' : 'Create Job Card'}
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: `${colors.adminSuccess}15`,
                        borderColor: colors.adminSuccess,
                        color: colors.adminSuccess
                    }}
                >
                    ✓ Job Card created successfully! Radiating...
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: `${colors.adminError}15`,
                        borderColor: colors.adminError,
                        color: colors.adminError
                    }}
                >
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Client & Vehicle Info */}
                <div className="space-y-6 lg:col-span-2">
                    <DashboardCard title="Client Information" subtitle="Contact details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Client Name" id="client_name" required>
                                <Input
                                    id="client_name"
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </FormField>
                            <FormField label="Phone Number" id="client_phone" required>
                                <Input
                                    id="client_phone"
                                    name="client_phone"
                                    value={formData.client_phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. +254 712 345 678"
                                />
                            </FormField>
                            <FormField label="Email Address" id="client_email">
                                <Input
                                    id="client_email"
                                    name="client_email"
                                    type="email"
                                    value={formData.client_email}
                                    onChange={handleChange}
                                    placeholder="e.g. john@example.com"
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    <DashboardCard
                        title="Vehicle Information"
                        subtitle="Vehicle details and current condition"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Registration Number" id="registration_number" required>
                                <Input
                                    id="registration_number"
                                    name="registration_number"
                                    value={formData.registration_number}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. KAA 123A"
                                />
                            </FormField>
                            <FormField label="Fuel Tank Level" id="fuel_tank_level">
                                <Select
                                    id="fuel_tank_level"
                                    name="fuel_tank_level"
                                    value={formData.fuel_tank_level}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Level</option>
                                    <option value="E">Empty</option>
                                    <option value="1/4">1/4</option>
                                    <option value="1/2">1/2</option>
                                    <option value="3/4">3/4</option>
                                    <option value="F">Full</option>
                                </Select>
                            </FormField>
                            <FormField label="Make" id="make" required>
                                <Input
                                    id="make"
                                    name="make"
                                    value={formData.make}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Toyota"
                                />
                            </FormField>
                            <FormField label="Model" id="model" required>
                                <Input
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Corolla"
                                />
                            </FormField>
                            <FormField label="Speedometer (KM)" id="speedometer_reading">
                                <Input
                                    id="speedometer_reading"
                                    name="speedometer_reading"
                                    type="number"
                                    value={formData.speedometer_reading}
                                    onChange={handleChange}
                                    placeholder="e.g. 150000"
                                />
                            </FormField>
                        </div>
                    </DashboardCard>
                </div>

                {/* Column 2: Job Details & Status */}
                <div className="space-y-6">
                    <DashboardCard title="Job Details" subtitle="Initial status and cost">
                        <div className="space-y-4">
                            <FormField label="Initial Status" id="status">
                                <Select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="in_progress">In Progress</option>
                                </Select>
                            </FormField>

                            <FormField label="Estimated Cost (KES)" id="estimated_cost">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium" style={{ color: colors.textSecondary }}>KES</span>
                                    <Input
                                        id="estimated_cost"
                                        name="estimated_cost"
                                        type="number"
                                        className="pl-12"
                                        value={formData.estimated_cost}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />
                                </div>
                            </FormField>

                            <FormField label="Payment Status" id="payment_status">
                                <Select
                                    id="payment_status"
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleChange}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </Select>
                            </FormField>
                        </div>
                    </DashboardCard>
                </div>

            </form>
        </motion.div>
    )
}
