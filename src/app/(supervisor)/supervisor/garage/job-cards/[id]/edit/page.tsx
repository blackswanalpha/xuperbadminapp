'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    X,
    User,
    Car,
    FileText,
    Wrench
} from 'lucide-react'
import { fetchJobCard, updateJobCard, JobCard } from '@/lib/api'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { useToast } from '@/components/ui/use-toast'

// Helper component for form fields
const FormField = ({ label, id, children, required }: any) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 flex">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
    </div>
)

const Input = ({ ...props }) => (
    <input
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
        {...props}
    />
)

const Select = ({ children, ...props }: any) => (
    <div className="relative">
        <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all"
            {...props}
        >
            {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
)

export default function EditJobCardPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<any>({
        client_name: '',
        client_phone: '',
        client_email: '',
        registration_number: '',
        make: '',
        model: '',
        speedometer_reading: '',
        fuel_tank_level: '',
        estimated_cost: 0,
        status: '',
        payment_status: ''
    })

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const data = await fetchJobCard(Number(id))
                setFormData({
                    client_name: data.client_name,
                    client_phone: data.client_phone || '',
                    client_email: data.client_email || '',
                    registration_number: data.registration_number,
                    make: data.make || '',
                    model: data.model || '',
                    speedometer_reading: data.speedometer_reading || '',
                    fuel_tank_level: data.fuel_tank_level || '',
                    estimated_cost: data.estimated_cost || 0,
                    status: data.status,
                    payment_status: data.payment_status
                })
            } catch (error) {
                console.error('Error loading job card:', error)
                toast({
                    title: "Error",
                    description: "Failed to load Job Card details.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateJobCard(Number(id), formData)
            toast({
                title: "Success",
                description: "Job Card updated successfully",
            })
            router.push(`/supervisor/garage/job-cards/${id}`)
        } catch (error) {
            console.error('Error updating job card:', error)
            toast({
                title: "Error",
                description: "Failed to update Job Card. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="text-gray-500" size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            Edit Job Card
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            Update job details, client info, and vehicle status
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                        style={{ backgroundColor: colors.supervisorPrimary }}
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Client & Vehicle Info */}
                <div className="space-y-6 lg:col-span-2">
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
                                />
                            </FormField>
                            <FormField label="Model" id="model" required>
                                <Input
                                    id="model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Speedometer (KM)" id="speedometer_reading">
                                <Input
                                    id="speedometer_reading"
                                    name="speedometer_reading"
                                    type="number"
                                    value={formData.speedometer_reading}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Client Information" subtitle="Contact details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Client Name" id="client_name" required>
                                <Input
                                    id="client_name"
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Phone Number" id="client_phone" required>
                                <Input
                                    id="client_phone"
                                    name="client_phone"
                                    value={formData.client_phone}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Email Address" id="client_email">
                                <Input
                                    id="client_email"
                                    name="client_email"
                                    type="email"
                                    value={formData.client_email}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                    </DashboardCard>
                </div>

                {/* Column 2: Job Details & Status */}
                <div className="space-y-6">
                    <DashboardCard title="Job Details" subtitle="Status and cost estimation">
                        <div className="space-y-4">
                            <FormField label="Current Status" id="status">
                                <Select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="started">Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormField>

                            <FormField label="Estimated Cost (KES)" id="estimated_cost">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">KES</span>
                                    <Input
                                        id="estimated_cost"
                                        name="estimated_cost"
                                        type="number"
                                        className="pl-12"
                                        value={formData.estimated_cost}
                                        onChange={handleChange}
                                    />
                                </div>
                            </FormField>
                        </div>
                    </DashboardCard>
                </div>

            </form>
        </motion.div>
    )
}
