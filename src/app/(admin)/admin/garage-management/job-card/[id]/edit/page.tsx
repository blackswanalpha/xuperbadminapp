'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash,
    Car,
    User,
    Wrench,
    ClipboardCheck,
    AlertTriangle
} from 'lucide-react'
import { fetchJobCard, updateJobCard, JobCard } from '@/lib/api'
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

const Input = ({ className = '', ...props }: any) => (
    <input
        className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

const Textarea = ({ className = '', ...props }: any) => (
    <textarea
        className={`flex w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        style={{
            borderColor: colors.borderLight,
            color: colors.textPrimary
        }}
        {...props}
    />
)

const Checkbox = ({ label, checked, onChange, id }: any) => (
    <label className="flex items-center gap-2 cursor-pointer" htmlFor={id}>
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm" style={{ color: colors.textPrimary }}>{label}</span>
    </label>
)

// Section Header Component
const SectionHeader = ({ icon: Icon, title, subtitle }: any) => (
    <div className="flex items-center gap-3 mb-4 pb-3 border-b" style={{ borderColor: colors.borderLight }}>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}10` }}>
            <Icon size={20} style={{ color: colors.adminPrimary }} />
        </div>
        <div>
            <h3 className="font-semibold" style={{ color: colors.textPrimary }}>{title}</h3>
            {subtitle && <p className="text-sm" style={{ color: colors.textSecondary }}>{subtitle}</p>}
        </div>
    </div>
)

export default function EditJobCardPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [jobCardNumber, setJobCardNumber] = useState('')

    const [formData, setFormData] = useState({
        // Section 1: Job Card Metadata
        order_number: '',
        handled_by_mechanic: '',

        // Section 2: Client Details
        client_name: '',
        client_phone: '',
        client_email: '',

        // Section 3: Car Details
        make: '',
        model: '',
        registration_number: '',
        speedometer_reading: '',
        fuel_tank_level: '1/2',
        date_required: '',
        chassis_number: '',
        engine_number: '',
        car_tested_with_customer: false,
        road_test_required: false,

        // Section 4: Vehicle Accessories Check
        jack_available: false,
        wheel_spanner_available: false,
        spare_wheel_available: false,
        tools_available: false,
        wheel_caps_present: false,
        radio_stereo_present: false,
        door_mirrors_present: false,
        triangles_present: false,
        first_aid_kit_present: false,
        cd_changer_present: false,
        mats_present: false,
        cigar_lighter_present: false,

        // Section 5: Defects & Repairs
        defects: '',
        repairs: '',

        // Section 6: Workshop Notes
        estimated_cost: 0,
        job_cost: 0,
        customer_approval_status: 'pending',

        // Section 7: Status
        status: 'draft',
        payment_status: 'unpaid',
        mechanic_status: ''
    })

    // Authorized Services state
    const [authorizedServices, setAuthorizedServices] = useState<{ description: string; cost: number; approved: boolean }[]>([])

    // Reported Defects state
    const [reportedDefects, setReportedDefects] = useState<{ description: string; severity: string; resolved: boolean }[]>([])

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const data = await fetchJobCard(Number(id)) as any
                setJobCardNumber(data.job_card_number || '')

                // Format date for datetime-local input
                const formatDateForInput = (dateStr: string) => {
                    if (!dateStr) return ''
                    const date = new Date(dateStr)
                    return date.toISOString().slice(0, 16)
                }

                setFormData({
                    order_number: data.order_number || '',
                    handled_by_mechanic: data.handled_by_mechanic || '',
                    client_name: data.client_name || '',
                    client_phone: data.client_phone || '',
                    client_email: data.client_email || '',
                    make: data.make || '',
                    model: data.model || '',
                    registration_number: data.registration_number || '',
                    speedometer_reading: data.speedometer_reading?.toString() || '',
                    fuel_tank_level: data.fuel_tank_level || '1/2',
                    date_required: formatDateForInput(data.date_required),
                    chassis_number: data.chassis_number || '',
                    engine_number: data.engine_number || '',
                    car_tested_with_customer: data.car_tested_with_customer || false,
                    road_test_required: data.road_test_required || false,
                    jack_available: data.jack_available || false,
                    wheel_spanner_available: data.wheel_spanner_available || false,
                    spare_wheel_available: data.spare_wheel_available || false,
                    tools_available: data.tools_available || false,
                    wheel_caps_present: data.wheel_caps_present || false,
                    radio_stereo_present: data.radio_stereo_present || false,
                    door_mirrors_present: data.door_mirrors_present || false,
                    triangles_present: data.triangles_present || false,
                    first_aid_kit_present: data.first_aid_kit_present || false,
                    cd_changer_present: data.cd_changer_present || false,
                    mats_present: data.mats_present || false,
                    cigar_lighter_present: data.cigar_lighter_present || false,
                    defects: data.defects || '',
                    repairs: data.repairs || '',
                    estimated_cost: data.estimated_cost || 0,
                    job_cost: data.job_cost || 0,
                    customer_approval_status: data.customer_approval_status || 'pending',
                    status: data.status || 'draft',
                    payment_status: data.payment_status || 'unpaid',
                    mechanic_status: data.mechanic_status || ''
                })

                // Load authorized services
                if (data.authorized_services && Array.isArray(data.authorized_services)) {
                    setAuthorizedServices(data.authorized_services.map((s: any) => ({
                        description: s.description || '',
                        cost: s.cost || 0,
                        approved: s.approved || false
                    })))
                }

                // Load reported defects
                if (data.reported_defects && Array.isArray(data.reported_defects)) {
                    setReportedDefects(data.reported_defects.map((d: any) => ({
                        description: d.description || '',
                        severity: d.severity || 'medium',
                        resolved: d.resolved || false
                    })))
                }
            } catch (error) {
                console.error('Error loading job card:', error)
                setError('Failed to load Job Card details.')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleCheckboxChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [name]: e.target.checked
        }))
    }

    // Service handlers
    const addService = () => {
        setAuthorizedServices(prev => [...prev, { description: '', cost: 0, approved: false }])
    }

    const removeService = (index: number) => {
        setAuthorizedServices(prev => prev.filter((_, i) => i !== index))
    }

    const updateService = (index: number, field: string, value: any) => {
        setAuthorizedServices(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }

    // Defect handlers
    const addDefect = () => {
        setReportedDefects(prev => [...prev, { description: '', severity: 'medium', resolved: false }])
    }

    const removeDefect = (index: number) => {
        setReportedDefects(prev => prev.filter((_, i) => i !== index))
    }

    const updateDefect = (index: number, field: string, value: any) => {
        setReportedDefects(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess(false)

        try {
            const submitData = {
                ...formData,
                speedometer_reading: formData.speedometer_reading ? parseInt(formData.speedometer_reading) : 0,
                estimated_cost: parseFloat(String(formData.estimated_cost)) || 0,
                job_cost: parseFloat(String(formData.job_cost)) || 0,
                date_required: formData.date_required || new Date().toISOString(),
                authorized_services: authorizedServices.filter(s => s.description.trim()),
                reported_defects: reportedDefects.filter(d => d.description.trim())
            }

            await updateJobCard(Number(id), submitData)
            setSuccess(true)
            setTimeout(() => {
                router.push(`/admin/garage-management/job-card/${id}`)
            }, 1000)
        } catch (error: any) {
            console.error('Error updating job card:', error)
            setError(error.response?.data?.message || 'Failed to update Job Card. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.adminPrimary }}></div>
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
                        onClick={() => router.push(`/admin/garage-management/job-card/${id}`)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft style={{ color: colors.textSecondary }} size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                            Edit Job Card
                        </h1>
                        <p style={{ color: colors.textSecondary }}>
                            {jobCardNumber} - Update job details and status
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => router.push(`/admin/garage-management/job-card/${id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        style={{ borderColor: colors.borderLight, color: colors.textPrimary }}
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                        style={{ backgroundColor: colors.adminPrimary }}
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
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
                    Job Card updated successfully! Redirecting...
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
                {/* Left Column */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Client Information */}
                    <DashboardCard>
                        <SectionHeader icon={User} title="Client Information" subtitle="Customer contact details" />
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
                            <FormField label="Email Address" id="client_email" required>
                                <Input
                                    id="client_email"
                                    name="client_email"
                                    type="email"
                                    value={formData.client_email}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    {/* Vehicle Information */}
                    <DashboardCard>
                        <SectionHeader icon={Car} title="Vehicle Information" subtitle="Vehicle details and specifications" />
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
                            <FormField label="Speedometer (KM)" id="speedometer_reading" required>
                                <Input
                                    id="speedometer_reading"
                                    name="speedometer_reading"
                                    type="number"
                                    value={formData.speedometer_reading}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Chassis Number" id="chassis_number" required>
                                <Input
                                    id="chassis_number"
                                    name="chassis_number"
                                    value={formData.chassis_number}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                            <FormField label="Engine Number" id="engine_number" required>
                                <Input
                                    id="engine_number"
                                    name="engine_number"
                                    value={formData.engine_number}
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
                                    <option value="Empty">Empty</option>
                                    <option value="1/4">1/4</option>
                                    <option value="1/2">1/2</option>
                                    <option value="3/4">3/4</option>
                                    <option value="Full">Full</option>
                                </Select>
                            </FormField>
                            <FormField label="Date Required" id="date_required" required>
                                <Input
                                    id="date_required"
                                    name="date_required"
                                    type="datetime-local"
                                    value={formData.date_required}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>
                        </div>
                        <div className="flex gap-6 mt-4 pt-4 border-t" style={{ borderColor: colors.borderLight }}>
                            <Checkbox
                                id="car_tested_with_customer"
                                label="Car tested with customer"
                                checked={formData.car_tested_with_customer}
                                onChange={handleCheckboxChange('car_tested_with_customer')}
                            />
                            <Checkbox
                                id="road_test_required"
                                label="Road test required"
                                checked={formData.road_test_required}
                                onChange={handleCheckboxChange('road_test_required')}
                            />
                        </div>
                    </DashboardCard>

                    {/* Vehicle Accessories Check */}
                    <DashboardCard>
                        <SectionHeader icon={ClipboardCheck} title="Vehicle Accessories Check" subtitle="Confirm items present in vehicle" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            <Checkbox id="jack_available" label="Jack" checked={formData.jack_available} onChange={handleCheckboxChange('jack_available')} />
                            <Checkbox id="wheel_spanner_available" label="Wheel Spanner" checked={formData.wheel_spanner_available} onChange={handleCheckboxChange('wheel_spanner_available')} />
                            <Checkbox id="spare_wheel_available" label="Spare Wheel" checked={formData.spare_wheel_available} onChange={handleCheckboxChange('spare_wheel_available')} />
                            <Checkbox id="tools_available" label="Tools" checked={formData.tools_available} onChange={handleCheckboxChange('tools_available')} />
                            <Checkbox id="wheel_caps_present" label="Wheel Caps" checked={formData.wheel_caps_present} onChange={handleCheckboxChange('wheel_caps_present')} />
                            <Checkbox id="radio_stereo_present" label="Radio/Stereo" checked={formData.radio_stereo_present} onChange={handleCheckboxChange('radio_stereo_present')} />
                            <Checkbox id="door_mirrors_present" label="Door Mirrors" checked={formData.door_mirrors_present} onChange={handleCheckboxChange('door_mirrors_present')} />
                            <Checkbox id="triangles_present" label="Warning Triangles" checked={formData.triangles_present} onChange={handleCheckboxChange('triangles_present')} />
                            <Checkbox id="first_aid_kit_present" label="First Aid Kit" checked={formData.first_aid_kit_present} onChange={handleCheckboxChange('first_aid_kit_present')} />
                            <Checkbox id="cd_changer_present" label="CD Changer" checked={formData.cd_changer_present} onChange={handleCheckboxChange('cd_changer_present')} />
                            <Checkbox id="mats_present" label="Floor Mats" checked={formData.mats_present} onChange={handleCheckboxChange('mats_present')} />
                            <Checkbox id="cigar_lighter_present" label="Cigar Lighter" checked={formData.cigar_lighter_present} onChange={handleCheckboxChange('cigar_lighter_present')} />
                        </div>
                    </DashboardCard>

                    {/* Defects & Repairs */}
                    <DashboardCard>
                        <SectionHeader icon={AlertTriangle} title="Defects & Repairs" subtitle="Document initial condition and planned work" />
                        <div className="space-y-4">
                            <FormField label="Car Brought In With Following Defects" id="defects">
                                <Textarea
                                    id="defects"
                                    name="defects"
                                    value={formData.defects}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describe any defects or issues noted when the car arrived..."
                                />
                            </FormField>
                            <FormField label="Repairs To Be Performed" id="repairs">
                                <Textarea
                                    id="repairs"
                                    name="repairs"
                                    value={formData.repairs}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="List the repairs and services to be performed..."
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    {/* Authorized Services */}
                    <DashboardCard>
                        <SectionHeader icon={Wrench} title="Authorized Services" subtitle="Services agreed with customer" />
                        <div className="space-y-3">
                            {authorizedServices.map((service, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2">
                                            <Input
                                                placeholder="Service description"
                                                value={service.description}
                                                onChange={(e: any) => updateService(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Cost"
                                                value={service.cost}
                                                onChange={(e: any) => updateService(index, 'cost', parseFloat(e.target.value) || 0)}
                                            />
                                            <Checkbox
                                                id={`service-approved-${index}`}
                                                label="Approved"
                                                checked={service.approved}
                                                onChange={(e: any) => updateService(index, 'approved', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="p-2 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash size={16} style={{ color: colors.adminError }} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addService}
                                className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
                            >
                                <Plus size={16} />
                                Add Service
                            </button>
                        </div>
                    </DashboardCard>

                    {/* Reported Defects */}
                    <DashboardCard>
                        <SectionHeader icon={AlertTriangle} title="Reported Defects" subtitle="Individual defects with severity" />
                        <div className="space-y-3">
                            {reportedDefects.map((defect, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 rounded-lg border" style={{ borderColor: colors.borderLight }}>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="md:col-span-2">
                                            <Input
                                                placeholder="Defect description"
                                                value={defect.description}
                                                onChange={(e: any) => updateDefect(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Select
                                                value={defect.severity}
                                                onChange={(e: any) => updateDefect(index, 'severity', e.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </Select>
                                            <Checkbox
                                                id={`defect-resolved-${index}`}
                                                label="Resolved"
                                                checked={defect.resolved}
                                                onChange={(e: any) => updateDefect(index, 'resolved', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeDefect(index)}
                                        className="p-2 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash size={16} style={{ color: colors.adminError }} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addDefect}
                                className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
                            >
                                <Plus size={16} />
                                Add Defect
                            </button>
                        </div>
                    </DashboardCard>
                </div>

                {/* Right Column - Job Details & Status */}
                <div className="space-y-6">
                    <DashboardCard title="Job Details" subtitle="Assignment and tracking">
                        <div className="space-y-4">
                            <FormField label="Order Number" id="order_number">
                                <Input
                                    id="order_number"
                                    name="order_number"
                                    value={formData.order_number}
                                    onChange={handleChange}
                                    placeholder="e.g. ORD-2024-001"
                                />
                            </FormField>

                            <FormField label="Handled By Mechanic" id="handled_by_mechanic" required>
                                <Input
                                    id="handled_by_mechanic"
                                    name="handled_by_mechanic"
                                    value={formData.handled_by_mechanic}
                                    onChange={handleChange}
                                    required
                                />
                            </FormField>

                            <FormField label="Mechanic Status" id="mechanic_status">
                                <Input
                                    id="mechanic_status"
                                    name="mechanic_status"
                                    value={formData.mechanic_status}
                                    onChange={handleChange}
                                    placeholder="e.g. Awaiting parts"
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Cost & Billing" subtitle="Financial information">
                        <div className="space-y-4">
                            <FormField label="Estimated Cost (KES)" id="estimated_cost">
                                <Input
                                    id="estimated_cost"
                                    name="estimated_cost"
                                    type="number"
                                    value={formData.estimated_cost}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>

                            <FormField label="Job Cost (KES)" id="job_cost">
                                <Input
                                    id="job_cost"
                                    name="job_cost"
                                    type="number"
                                    value={formData.job_cost}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />
                            </FormField>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Status" subtitle="Job and payment status">
                        <div className="space-y-4">
                            <FormField label="Job Status" id="status">
                                <Select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </Select>
                            </FormField>

                            <FormField label="Payment Status" id="payment_status">
                                <Select
                                    id="payment_status"
                                    name="payment_status"
                                    value={formData.payment_status}
                                    onChange={handleChange}
                                >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="deposit">Deposit</option>
                                    <option value="partial">Partial</option>
                                    <option value="paid">Paid</option>
                                </Select>
                            </FormField>

                            <FormField label="Customer Approval" id="customer_approval_status">
                                <Select
                                    id="customer_approval_status"
                                    name="customer_approval_status"
                                    value={formData.customer_approval_status}
                                    onChange={handleChange}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </Select>
                            </FormField>
                        </div>
                    </DashboardCard>
                </div>
            </form>
        </motion.div>
    )
}
