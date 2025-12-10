'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  Eye,
  EyeOff,
} from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchUser, updateUser } from '@/lib/api'
import { User as UserType, UserRole, UserStatus, ClientUser } from '@/types/user-management'

interface EditUserFormData {
  name: string
  email: string
  phone: string
  role: UserRole
  status: 'Active' | 'Inactive' | 'Suspended'
  idNumber?: string
  physicalAddress?: string
  branchId?: string
  // Role-specific fields
  emergencyContact?: string
  drivingLicense?: string
  contractTerms?: string
  commissionRate?: number
  supervisorLevel?: string
  // Password fields (optional for editing)
  newPassword?: string
  confirmNewPassword?: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [originalUser, setOriginalUser] = useState<UserType | null>(null)
  const [formData, setFormData] = useState<EditUserFormData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const userData = await fetchUser(userId) as UserType;
      setOriginalUser(userData)
      
      // Initialize form data
      const isClient = userData.role === 'Client';
      const clientData = isClient ? (userData as ClientUser) : null;

      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status as UserStatus,
        idNumber: isClient ? clientData?.idNumber || '' : '',
        physicalAddress: isClient ? clientData?.physicalAddress || '' : '',
        branchId: userData.branchId || '',
        newPassword: '',
        confirmNewPassword: '',
      })
    } catch (err: any) {
      console.error('Error fetching user data:', err)
      setErrors({ fetch: err?.response?.data?.message || err?.message || 'Failed to fetch user data' })
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: keyof EditUserFormData, value: any) => {
    if (!formData) return
    
    setFormData(prev => ({
      ...prev!,
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

  // Validate form data
  const validateForm = (): boolean => {
    if (!formData) return false
    
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'

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

    // Password validation (only if new password is provided)
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match'
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long'
    }

    // Role-specific validation
    if (formData.role === 'Client' && !formData.idNumber?.trim()) {
      newErrors.idNumber = 'ID Number is required for clients'
    }

    if (formData.role === 'Driver' && !formData.drivingLicense?.trim()) {
      newErrors.drivingLicense = 'Driving license is required for drivers'
    }

    if (formData.role === 'Agent' && formData.commissionRate !== undefined) {
      if (formData.commissionRate < 0 || formData.commissionRate > 100) {
        newErrors.commissionRate = 'Commission rate must be between 0 and 100%'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData || !validateForm()) return

    setSaving(true)
    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        status: formData.status,
        ...(formData.idNumber && { idNumber: formData.idNumber.trim() }),
        ...(formData.physicalAddress && { physicalAddress: formData.physicalAddress.trim() }),
        ...(formData.branchId && { branchId: formData.branchId.trim() }),
      }

      // Only include password if it's being changed
      if (formData.newPassword && formData.newPassword.trim()) {
        updateData.password = formData.newPassword
      }

      await updateUser(userId, updateData)
      setSuccess('User updated successfully!')
      
      // Refresh user data
      setTimeout(() => {
        fetchUserData()
        setSuccess(null)
      }, 2000)

    } catch (err: any) {
      console.error('Error updating user:', err)
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to update user'
      setErrors({ submit: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  // Check if form has changes
  const hasChanges = (): boolean => {
    if (!formData || !originalUser) return false
    
    const isClient = originalUser.role === 'Client';
    const originalClientData = isClient ? (originalUser as ClientUser) : null;

    return !!(
      formData.name !== originalUser.name ||
      formData.email !== originalUser.email ||
      formData.phone !== originalUser.phone ||
      formData.status !== originalUser.status ||
      formData.idNumber !== (isClient ? originalClientData?.idNumber || '' : '') ||
      formData.physicalAddress !== (isClient ? originalClientData?.physicalAddress || '' : '') ||
      formData.branchId !== (originalUser.branchId || '') ||
      (formData.newPassword && formData.newPassword.trim() !== '')
    )
  }

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return colors.adminError
      case 'Supervisor': return colors.adminWarning
      case 'Client': return colors.adminPrimary
      case 'Agent': return colors.adminSuccess
      case 'Staff': return colors.adminAccent
      case 'Supplier': return colors.textSecondary
      default: return colors.textTertiary
    }
  }

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: colors.textSecondary }}>Loading user data...</p>
        </div>
      </div>
    )
  }

  if (errors.fetch || !formData || !originalUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errors.fetch || 'Failed to load user data'}</span>
          </div>
          <button
            onClick={() => router.push('/admin/user-management')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Back to Users
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push(`/admin/user-management/${userId}`)}
            className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.borderLight }}
          >
            <ArrowLeft size={20} style={{ color: colors.textSecondary }} />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: getRoleColor(originalUser.role) }}
              >
                {originalUser.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  Edit {originalUser.name}
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getRoleColor(originalUser.role)}20`,
                      color: getRoleColor(originalUser.role),
                    }}
                  >
                    {originalUser.role}
                  </span>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>
                    {originalUser.email}
                  </span>
                </div>
              </div>
            </div>
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <DashboardCard
          title="Edit User Information"
          subtitle="Update user details and settings"
        >
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Basic Information
              </h3>
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
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                        errors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      disabled={saving}
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
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      disabled={saving}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

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
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                        errors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      disabled={saving}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 transition-all"
                    disabled={saving}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Role Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="mt-1 text-xs text-gray-500">Role cannot be changed. Contact administrator if needed.</p>
                </div>

                {(formData.role === 'Client' || formData.idNumber) && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                      ID Number {formData.role === 'Client' ? '*' : ''}
                    </label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textTertiary }} />
                      <input
                        type="text"
                        value={formData.idNumber || ''}
                        onChange={(e) => handleInputChange('idNumber', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all ${
                          errors.idNumber ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                        }`}
                        disabled={saving}
                      />
                    </div>
                    {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
                  </div>
                )}

                {(formData.role === 'Supervisor' || formData.branchId) && (
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
                        disabled={saving}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Additional Information
              </h3>
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
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Change Password (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword || ''}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className={`w-full pr-12 pl-4 py-3 rounded-lg border transition-all ${
                        errors.newPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="Enter new password"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: colors.textTertiary }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmNewPassword || ''}
                    onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all ${
                      errors.confirmNewPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Confirm new password"
                    disabled={saving}
                  />
                  {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
              <button
                type="button"
                onClick={() => router.push(`/admin/user-management/${userId}`)}
                className="px-6 py-3 rounded-lg border hover:bg-gray-50 transition-colors"
                style={{ borderColor: colors.borderLight }}
                disabled={saving}
              >
                <X size={18} className="inline mr-2" />
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 rounded-lg text-white font-medium transition-opacity disabled:opacity-50"
                style={{ backgroundColor: hasChanges() ? colors.adminPrimary : colors.textTertiary }}
                disabled={saving || !hasChanges()}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save size={18} className="inline mr-2" />
                    Save Changes
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