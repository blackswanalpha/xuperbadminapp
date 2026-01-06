'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  Building,
  Car,
  UserCheck,
  Save,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { Tabs, TabPanel } from '@/components/shared/tabs'
import { colors } from '@/lib/theme/colors'
import { createUser } from '@/lib/api'
import { UserRole } from '@/types/user-management'

interface UserFormData {
  name: string
  email: string
  phone: string
  role: UserRole
  idNumber?: string
  physicalAddress?: string
  branchId?: string
  password: string
  confirmPassword: string
  // Additional fields based on role
  emergencyContact?: string
  drivingLicense?: string
  contractTerms?: string
  commissionRate?: number
  supervisorLevel?: string
  permissions?: string[]
}

const initialFormData: UserFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Client',
  password: '',
  confirmPassword: '',
}

export default function AddUserPage() {
  const router = useRouter()
  const [activeRole, setActiveRole] = useState<UserRole>('Client')
  const [formData, setFormData] = useState<UserFormData>({
    ...initialFormData,
    role: activeRole,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  // Role-specific tabs
  const roleTabs = [
    { id: 'Client', label: 'Add Client', icon: <User size={18} /> },
    { id: 'Agent', label: 'Add Agent', icon: <UserCheck size={18} /> },
    { id: 'Driver', label: 'Add Driver/Staff', icon: <Car size={18} /> },
    { id: 'Supervisor', label: 'Add Supervisor', icon: <Building size={18} /> },
  ]

  // Handle form input changes
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle role change
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role)
    setFormData(prev => ({
      ...initialFormData,
      role,
    }))
    setErrors({})
    setSuccess(null)
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    // Password validation - only for Staff/Driver and Supervisor
    if (['Driver', 'Supervisor'].includes(formData.role)) {
      if (!formData.password) newErrors.password = 'Password is required'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    const phoneRegex = /^(\+254|0)[0-9]{9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Kenyan phone number'
    }

    // Role-specific validation
    if (formData.role === 'Client') {
      if (!formData.idNumber?.trim()) newErrors.idNumber = 'ID Number is required for clients'
    }

    if (formData.role === 'Driver') {
      if (!formData.drivingLicense?.trim()) newErrors.drivingLicense = 'Driving license is required for drivers'
    }

    if (formData.role === 'Agent') {
      if (!formData.commissionRate || formData.commissionRate < 0 || formData.commissionRate > 100) {
        newErrors.commissionRate = 'Valid commission rate (0-100%) is required'
      }
    }

    if (formData.role === 'Supervisor') {
      if (!formData.supervisorLevel?.trim()) newErrors.supervisorLevel = 'Supervisor level is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      // Map frontend role to backend role
      const mapRoleToBackend = (role: UserRole): string => {
        switch (role) {
          case 'Client': return 'CLIENT'
          case 'Agent': return 'AGENT'
          case 'Driver': return 'STAFF' // Map Driver to STAFF as per backend requirement
          case 'Supervisor': return 'SUPERVISOR'
          case 'Admin': return 'ADMIN'
          default: return (role as string).toUpperCase()
        }
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        role: mapRoleToBackend(formData.role),
        ...(formData.password && { password: formData.password }),
        ...(formData.idNumber && { idNumber: formData.idNumber.trim() }),
        ...(formData.physicalAddress && { physicalAddress: formData.physicalAddress.trim() }),
        ...(formData.branchId && { branchId: formData.branchId.trim() }),
      }

      await createUser(userData as any)
      setSuccess(`${formData.role.toLowerCase()} created successfully!`)

      // Reset form
      setTimeout(() => {
        router.push('/admin/user-management')
      }, 2000)

    } catch (err: any) {
      console.error('Error creating user:', err)
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create user'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  // Common form fields render function
  const renderCommonFields = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Full Name *
          </label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              placeholder="Enter full name"
              disabled={loading}
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Email Address *
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Phone Number *
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              placeholder="+254712345678"
              disabled={loading}
            />
          </div>
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Role
          </label>
          <div className="relative">
            <Shield size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="text"
              value={formData.role}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-100"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          Physical Address
        </label>
        <div className="relative">
          <MapPin size={18} className="absolute left-3 top-3" style={{ color: colors.textTertiary }} />
          <textarea
            value={formData.physicalAddress || ''}
            onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all resize-none"
            placeholder="Enter physical address"
            rows={3}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )

  // Separated password fields render function
  const renderPasswordFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          Password *
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border transition-all ${errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
          placeholder="Enter password"
          disabled={loading}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          Confirm Password *
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border transition-all ${errors.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
            }`}
          placeholder="Confirm password"
          disabled={loading}
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
      </div>
    </div>
  )

  // Client-specific fields
  const renderClientFields = () => (
    <div className="space-y-6">
      {renderCommonFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            ID Number *
          </label>
          <div className="relative">
            <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="text"
              value={formData.idNumber || ''}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.idNumber ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              placeholder="Enter ID number"
              disabled={loading}
            />
          </div>
          {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Emergency Contact
          </label>
          <input
            type="tel"
            value={formData.emergencyContact || ''}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
            placeholder="Emergency contact number"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )

  // Agent-specific fields
  const renderAgentFields = () => (
    <div className="space-y-6">
      {renderCommonFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Commission Rate (%) *
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.commissionRate || ''}
            onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value) || 0)}
            className={`w-full px-4 py-3 rounded-lg border transition-all ${errors.commissionRate ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            placeholder="5.0"
            disabled={loading}
          />
          {errors.commissionRate && <p className="mt-1 text-sm text-red-600">{errors.commissionRate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            ID Number
          </label>
          <input
            type="text"
            value={formData.idNumber || ''}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
            placeholder="Enter ID number"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          Contract Terms
        </label>
        <textarea
          value={formData.contractTerms || ''}
          onChange={(e) => handleInputChange('contractTerms', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all resize-none"
          placeholder="Enter contract terms and conditions"
          rows={3}
          disabled={loading}
        />
      </div>
    </div>
  )

  // Staff/Driver-specific fields
  const renderStaffFields = () => (
    <div className="space-y-6">
      {renderCommonFields()}
      {renderPasswordFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Driving License Number *
          </label>
          <div className="relative">
            <Car size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="text"
              value={formData.drivingLicense || ''}
              onChange={(e) => handleInputChange('drivingLicense', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${errors.drivingLicense ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
              placeholder="Enter driving license number"
              disabled={loading}
            />
          </div>
          {errors.drivingLicense && <p className="mt-1 text-sm text-red-600">{errors.drivingLicense}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            ID Number
          </label>
          <input
            type="text"
            value={formData.idNumber || ''}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
            placeholder="Enter ID number"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          Emergency Contact
        </label>
        <input
          type="tel"
          value={formData.emergencyContact || ''}
          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
          placeholder="Emergency contact number"
          disabled={loading}
        />
      </div>
    </div>
  )

  // Supervisor-specific fields
  const renderSupervisorFields = () => (
    <div className="space-y-6">
      {renderCommonFields()}
      {renderPasswordFields()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Supervisor Level *
          </label>
          <select
            value={formData.supervisorLevel || ''}
            onChange={(e) => handleInputChange('supervisorLevel', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-all ${errors.supervisorLevel ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
              }`}
            disabled={loading}
          >
            <option value="">Select supervisor level</option>
            <option value="junior">Junior Supervisor</option>
            <option value="senior">Senior Supervisor</option>
            <option value="department">Department Supervisor</option>
          </select>
          {errors.supervisorLevel && <p className="mt-1 text-sm text-red-600">{errors.supervisorLevel}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
            Branch ID
          </label>
          <div className="relative">
            <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
            <input
              type="text"
              value={formData.branchId || ''}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
              placeholder="Enter branch ID"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          ID Number
        </label>
        <input
          type="text"
          value={formData.idNumber || ''}
          onChange={(e) => handleInputChange('idNumber', e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
          placeholder="Enter ID number"
          disabled={loading}
        />
      </div>
    </div>
  )

  // Get form fields based on selected role
  const getCurrentFormFields = () => {
    switch (activeRole) {
      case 'Client': return renderClientFields()
      case 'Agent': return renderAgentFields()
      case 'Driver': return renderStaffFields()
      case 'Supervisor': return renderSupervisorFields()
      default: return renderCommonFields()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/user-management')}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.borderLight }}
          >
            <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
          </button>

          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Add New User
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Create a new user account with role-specific information
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-green-100 border border-green-400 text-green-700 flex items-center gap-2"
        >
          <CheckCircle size={20} />
          {success}
        </motion.div>
      )}

      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-700 flex items-center gap-2"
        >
          <AlertCircle size={20} />
          {errors.submit}
        </motion.div>
      )}

      {/* Role Selection Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={roleTabs}
          activeTab={activeRole}
          onTabChange={(role) => handleRoleChange(role as UserRole)}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <DashboardCard
          title={`Add ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1).toLowerCase()}`}
          subtitle={`Fill in the details to create a new ${activeRole.toLowerCase()}`}
        >
          <div className="space-y-8">
            {getCurrentFormFields()}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
              <button
                type="button"
                onClick={() => router.push('/admin/user-management')}
                className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderLight }}
                disabled={loading}
              >
                <X size={18} className="inline mr-2" />
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: colors.adminPrimary }}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <>
                    <Save size={18} className="inline mr-2" />
                    Create {activeRole.charAt(0).toUpperCase() + activeRole.slice(1).toLowerCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </DashboardCard>
      </form>
    </motion.div>
  )
}