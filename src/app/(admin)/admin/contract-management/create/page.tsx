'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MapPin
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import SignaturePad from '@/components/shared/signature-pad'
import { colors } from '@/lib/theme/colors'
import { fetchVehicles, fetchUsers, createUser, updateUser } from '@/lib/api'
import api from '@/lib/axios'
import axios from 'axios'
import { DatePicker } from '@/components/shared/date-picker'
import { format } from 'date-fns'

// Helper functions for date format conversion
const formatDateForAPI = (date: Date | undefined): string => {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

export default function CreateContractPage() {
  const router = useRouter()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [disabledDates, setDisabledDates] = useState<Date[]>([])
  const [isClientDriver, setIsClientDriver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    // Contract Information
    contract_number: '',
    client: '',
    vehicle: '',
    driver: '',
    start_date: '',
    end_date: '',
    total_days: '1',
    status: 'ACTIVE',
    contract_type: 'DAILY',
    agent: '', // Added agent field

    // Driver Information
    driver_name: '',
    driver_id_number: '',
    driving_license_number: '',
    driving_license_expiry: '',
    driving_license_years_held: '0',

    // Guarantor Information
    guarantor_name: '',
    guarantor_phone: '',
    guarantor_id_number: '',
    guarantor_address: '',

    // Financial fields
    total_contract_value: '',
    initial_contract_cost: '',
    extend_cost: '0',
    amount_paid: '0',
    balance_due: '',
    security_deposit: '',
    excess_value: '0',

    // Additional Info
    notes: '',
    damage_notes: '',
    purpose: '',
    checklist: {},

    // Signatures (Base64)
    client_signature: '',
    driver_signature: '',
    creator_signature: '',

    // New Client Creation
    isNewClient: false,
    newClientName: '',
    newClientEmail: '',
    newClientPhone: '',
    newClientIdNumber: '',
    newClientAddress: '',
    newClientLat: '',
    newClientLng: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load vehicles and clients
        const [vehiclesData, usersData] = await Promise.all([
          fetchVehicles(1, 1000),
          fetchUsers(1, 1000)
        ])

        setVehicles(vehiclesData.vehicles)
        const allUsers = usersData.results || []
        setClients(allUsers.filter((user: any) => user.role?.toUpperCase() === 'CLIENT'))
        setDrivers(allUsers.filter((user: any) => user.role?.toUpperCase() === 'DRIVER'))
        setAgents(allUsers.filter((user: any) => user.role?.toUpperCase() === 'AGENT'))

        // Generate default contract number
        const now = new Date()
        const contractNumber = `CNT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`
        setFormData(prev => ({
          ...prev,
          contract_number: contractNumber,
          start_date: format(now, 'yyyy-MM-dd')
        }))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Fetch blocked dates when vehicle is selected
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      if (!formData.vehicle) return

      try {
        // Fetch active and pending contracts for this vehicle
        const res = await api.get(`/contracts/?vehicle=${formData.vehicle}&status=ACTIVE`)

        const contracts = Array.isArray(res.data) ? res.data : res.data.results || []

        const dates: Date[] = []
        contracts.forEach((contract: any) => {
          const start = new Date(contract.start_date)
          const end = new Date(contract.end_date)

          let current = new Date(start)
          while (current <= end) {
            dates.push(new Date(current))
            current.setDate(current.getDate() + 1)
          }
        })

        setDisabledDates(dates)
      } catch (error) {
        console.error('Error fetching vehicle availability:', error)
      }
    }

    fetchUnavailableDates()
  }, [formData.vehicle])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-calculate balance due when relevant fields change
    if (['total_contract_value', 'amount_paid', 'initial_contract_cost', 'extend_cost', 'security_deposit'].includes(field)) {
      setTimeout(() => {
        setFormData(prev => {
          const initialCost = parseInt(prev.initial_contract_cost) || 0
          const extendCost = parseInt(prev.extend_cost) || 0
          const totalValue = initialCost + extendCost
          const amountPaid = parseInt(prev.amount_paid) || 0
          const deposit = parseInt(prev.security_deposit) || 0
          const balanceDue = Math.max(0, totalValue - amountPaid - deposit)

          return {
            ...prev,
            total_contract_value: totalValue.toString(),
            balance_due: balanceDue.toString()
          }
        })
      }, 0)
    }
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? format(date, 'yyyy-MM-dd') : ''
    }))
  }

  const handleTotalDaysChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      total_days: value
    }))
  }

  const handleSignatureChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          newClientLat: position.coords.latitude.toString(),
          newClientLng: position.coords.longitude.toString()
        }))
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to retrieve your location. Please ensure location services are enabled.')
      }
    )
  }

  const handleClientDriverToggle = (checked: boolean) => {
    setIsClientDriver(checked)
    if (checked) {
      if (!formData.isNewClient && formData.client) {
        const client = clients.find(c => String(c.id) === String(formData.client))
        if (client) {
          setFormData(prev => ({
            ...prev,
            driver_name: client.name || '',
            driver_id_number: client.idNumber || '',
          }))
        }
      } else if (formData.isNewClient) {
        setFormData(prev => ({
          ...prev,
          driver_name: formData.newClientName,
          driver_id_number: formData.newClientIdNumber,
        }))
      }
    }
  }

  useEffect(() => {
    if (isClientDriver && formData.isNewClient) {
      setFormData(prev => ({
        ...prev,
        driver_name: formData.newClientName,
        driver_id_number: formData.newClientIdNumber
      }))
    }
  }, [isClientDriver, formData.isNewClient, formData.newClientName, formData.newClientIdNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let clientId = formData.client ? parseInt(formData.client) : null

      // Handle New Client Creation
      if (formData.isNewClient) {
        try {
          const name = formData.newClientName.trim()
          const email = formData.newClientEmail.trim().toLowerCase()
          const phone = formData.newClientPhone.trim()

          if (!name || !email || !phone) {
            alert('Please fill in Name, Email, and Phone for the new client.')
            setSaving(false)
            return
          }

          const newUserPayload = {
            name,
            email,
            phone,
            role: 'CLIENT',
            ...(formData.newClientIdNumber?.trim() && { idNumber: formData.newClientIdNumber.trim() }),
            ...(formData.newClientAddress?.trim() && { physicalAddress: formData.newClientAddress.trim() }),
            ...(formData.newClientLat && !isNaN(parseFloat(formData.newClientLat)) && { latitude: parseFloat(formData.newClientLat) }),
            ...(formData.newClientLng && !isNaN(parseFloat(formData.newClientLng)) && { longitude: parseFloat(formData.newClientLng) }),
          }

          try {
            const newUser = await createUser(newUserPayload as any)
            clientId = Number(newUser.id)
          } catch (createError: any) {
            // Check if user already exists (usually 400 Bad Request with field errors)
            if (axios.isAxiosError(createError) && createError.response?.status === 400) {
              const errorData = createError.response.data
              const isConflict = errorData.email ||
                (typeof errorData.error === 'string' && errorData.error.toLowerCase().includes('already exists')) ||
                (errorData.detail && errorData.detail.toLowerCase().includes('already exists'))

              if (isConflict) {
                try {
                  // Try to find the existing user by email
                  const usersResponse = await fetchUsers(1, 10, email)
                  const existingUser = usersResponse.results.find((u: any) => u.email.toLowerCase() === email.toLowerCase())

                  if (existingUser) {
                    // Update existing user with provided info
                    const updatedUser = await updateUser(existingUser.id, newUserPayload as any)
                    clientId = Number(updatedUser.id)
                  } else {
                    throw createError
                  }
                } catch (findError) {
                  throw createError
                }
              } else {
                throw createError
              }
            } else {
              throw createError
            }
          }
        } catch (createError: any) {
          console.error('Error handling client creation/update:', createError)

          let errorMessage = 'Failed to handle client information.'
          if (axios.isAxiosError(createError) && createError.response?.data) {
            const data = createError.response.data
            if (data.error) {
              errorMessage = data.error
            } else if (typeof data === 'object') {
              errorMessage = Object.entries(data)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n')
            }
          }

          alert(errorMessage + '\nPlease check the details and try again.')
          setSaving(false)
          return
        }
      }

      if (!clientId) {
        alert('Please select a client or create a new one.')
        setSaving(false)
        return
      }

      const createData = {
        // Contract info
        contract_number: formData.contract_number,
        client: clientId,
        vehicle: parseInt(formData.vehicle),
        driver: formData.driver ? parseInt(formData.driver) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        contract_type: formData.contract_type,

        // Driver info
        driver_name: formData.driver_name,
        driver_id_number: formData.driver_id_number,
        driving_license_number: formData.driving_license_number,
        driving_license_expiry: formData.driving_license_expiry || null,
        driving_license_years_held: parseInt(formData.driving_license_years_held) || 0,

        // Guarantor info
        guarantor_name: formData.guarantor_name || null,
        guarantor_phone: formData.guarantor_phone || null,
        guarantor_id_number: formData.guarantor_id_number || null,
        guarantor_address: formData.guarantor_address || null,

        // Financial
        total_contract_value: parseInt(formData.total_contract_value) || 0,
        initial_contract_cost: formData.initial_contract_cost ? parseInt(formData.initial_contract_cost) : 0,
        extend_cost: parseInt(formData.extend_cost) || 0,
        amount_paid: parseInt(formData.amount_paid) || 0,
        balance_due: parseInt(formData.balance_due) || 0,
        security_deposit: formData.security_deposit ? parseInt(formData.security_deposit) : 0,
        excess_value: parseInt(formData.excess_value) || 0,

        // Additional
        notes: formData.notes || null,
        damage_notes: formData.damage_notes || null,
        purpose: formData.purpose || null,
        checklist: formData.checklist,

        // Signatures
        client_signature: formData.client_signature || null,
        driver_signature: formData.driver_signature || null,
        creator_signature: formData.creator_signature || null,

        // Agent
        agent: formData.agent ? parseInt(formData.agent) : null,
      }

      const response = await api.post('/contracts/', createData)
      router.push(`/admin/contract-management/${response.data.id}`)
    } catch (error) {
      console.error('Error creating contract:', error)
      if (axios.isAxiosError(error) && error.response) {
        // Format server validation errors
        const serverErrors = error.response.data
        let errorMessage = 'Failed to create contract:\n'

        if (typeof serverErrors === 'object') {
          Object.entries(serverErrors).forEach(([key, value]) => {
            const errorText = Array.isArray(value) ? value.join(', ') : String(value)
            errorMessage += `\n- ${key}: ${errorText}`
          })
        } else {
          errorMessage += String(serverErrors)
        }

        alert(errorMessage)
      } else {
        alert('Failed to create contract. Please check your connection and try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: colors.textSecondary }}>Loading...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Contracts
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Create New Contract
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Create a new rental contract and agreement
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              form="contract-form"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: colors.adminPrimary }}
            >
              <Save size={18} />
              {saving ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form id="contract-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Information - Moved to Top */}
            <DashboardCard title="Vehicle Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Vehicle *
                  </label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => handleInputChange('vehicle', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.registration_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </DashboardCard>

            {/* Contract Information */}
            <DashboardCard title="Contract Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Contract Number *
                  </label>
                  <input
                    type="text"
                    value={formData.contract_number}
                    readOnly
                    className="w-full p-3 border rounded-lg focus:outline-none bg-gray-50 cursor-not-allowed"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Total Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_days}
                    onChange={(e) => handleTotalDaysChange(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Start Date *
                  </label>
                  <DatePicker
                    date={formData.start_date ? new Date(formData.start_date) : undefined}
                    setDate={(date) => handleDateChange('start_date', date)}
                    disabledDates={disabledDates}
                    placeholder="Select start date"
                  />
                  {disabledDates.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">Some dates are unavailable due to existing bookings.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    End Date *
                  </label>
                  <DatePicker
                    date={formData.end_date ? new Date(formData.end_date) : undefined}
                    setDate={(date) => handleDateChange('end_date', date)}
                    disabledDates={disabledDates}
                    placeholder="Select end date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Intended use of the vehicle"
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Client Information */}
            <DashboardCard title="Client Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="isNewClient"
                    checked={formData.isNewClient}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        isNewClient: e.target.checked,
                        client: '' // Clear selected client when toggling
                      }))
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isNewClient" className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Create New Client
                  </label>
                </div>

                {!formData.isNewClient ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Select Client *
                      </label>
                      <select
                        value={formData.client}
                        onChange={(e) => handleInputChange('client', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        required={!formData.isNewClient}
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name || client.email}
                          </option>
                        ))}
                      </select>
                      {clients.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">No clients available. Create clients first.</p>
                      )}
                    </div>

                    {/* Auto-filled Read-only Fields */}
                    {formData.client && clients.find(c => String(c.id) === String(formData.client)) && (() => {
                      const selectedClient = clients.find(c => String(c.id) === String(formData.client))
                      if (!selectedClient) return null
                      return (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={selectedClient.name || ''}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              Email Address
                            </label>
                            <input
                              type="text"
                              value={selectedClient.email || ''}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={selectedClient.phone || ''}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              ID Number
                            </label>
                            <input
                              type="text"
                              value={selectedClient.idNumber || 'N/A'}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              Home Address
                            </label>
                            <textarea
                              rows={2}
                              value={selectedClient.physicalAddress || 'N/A'}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600 resize-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                              Pickup Address (Geolocation)
                            </label>
                            <input
                              type="text"
                              value={selectedClient.latitude && selectedClient.longitude
                                ? `${selectedClient.latitude}, ${selectedClient.longitude}`
                                : 'Location not set'}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none text-gray-600"
                            />
                          </div>
                        </>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    {/* New Client Editable Fields */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.newClientName}
                        onChange={(e) => handleInputChange('newClientName', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="Client Name"
                        required={formData.isNewClient}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.newClientEmail}
                        onChange={(e) => handleInputChange('newClientEmail', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="client@example.com"
                        required={formData.isNewClient}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.newClientPhone}
                        onChange={(e) => handleInputChange('newClientPhone', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="+254..."
                        required={formData.isNewClient}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={formData.newClientIdNumber}
                        onChange={(e) => handleInputChange('newClientIdNumber', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="National ID"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Home Address
                      </label>
                      <textarea
                        rows={2}
                        value={formData.newClientAddress}
                        onChange={(e) => handleInputChange('newClientAddress', e.target.value)}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{ borderColor: colors.borderLight }}
                        placeholder="Enter physical address"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                        Pickup Coordinates
                      </label>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        className="mb-3 text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <MapPin size={16} />
                        Get Current Location
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="number"
                            step="any"
                            value={formData.newClientLat}
                            onChange={(e) => handleInputChange('newClientLat', e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ borderColor: colors.borderLight }}
                            placeholder="Latitude"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            step="any"
                            value={formData.newClientLng}
                            onChange={(e) => handleInputChange('newClientLng', e.target.value)}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{ borderColor: colors.borderLight }}
                            placeholder="Longitude"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DashboardCard>

            {/* Driver Information */}
            <DashboardCard title="Driver Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="isClientDriver"
                    checked={isClientDriver}
                    onChange={(e) => handleClientDriverToggle(e.target.value === 'on' ? !isClientDriver : e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isClientDriver" className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Client is also the Driver
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Registered Driver (Optional)
                  </label>
                  <select
                    value={formData.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    disabled={isClientDriver}
                  >
                    <option value="">Select a registered driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.first_name || driver.last_name
                          ? `${driver.first_name || ''} ${driver.last_name || ''}`.trim()
                          : driver.email
                        }
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => handleInputChange('driver_name', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isClientDriver ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Full name of driver"
                    readOnly={isClientDriver}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Driver ID Number *
                  </label>
                  <input
                    type="text"
                    value={formData.driver_id_number}
                    onChange={(e) => handleInputChange('driver_id_number', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isClientDriver ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    style={{ borderColor: colors.borderLight }}
                    placeholder="National ID number"
                    readOnly={isClientDriver}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Driving License Number *
                  </label>
                  <input
                    type="text"
                    value={formData.driving_license_number}
                    onChange={(e) => handleInputChange('driving_license_number', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="License number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    License Expiry Date *
                  </label>
                  <DatePicker
                    date={formData.driving_license_expiry ? new Date(formData.driving_license_expiry) : undefined}
                    setDate={(date) => handleDateChange('driving_license_expiry', date)}
                    placeholder="Select expiry date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    License Years Held
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.driving_license_years_held}
                    onChange={(e) => handleInputChange('driving_license_years_held', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Guarantor Information */}
            <DashboardCard title="Guarantor Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Guarantor Name
                  </label>
                  <input
                    type="text"
                    value={formData.guarantor_name}
                    onChange={(e) => handleInputChange('guarantor_name', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Full name of guarantor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Guarantor Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.guarantor_phone}
                    onChange={(e) => handleInputChange('guarantor_phone', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="+254..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Guarantor ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.guarantor_id_number}
                    onChange={(e) => handleInputChange('guarantor_id_number', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="National ID number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Guarantor Address
                  </label>
                  <textarea
                    value={formData.guarantor_address}
                    onChange={(e) => handleInputChange('guarantor_address', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: colors.borderLight }}
                    rows={2}
                    placeholder="Full address"
                  />
                </div>
              </div>
            </DashboardCard>

            {/* Agent Information */}
            <DashboardCard title="Agent Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Select Agent (Optional)
                  </label>
                  <select
                    value={formData.agent || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, agent: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="">Select an agent</option>
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name || agent.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </DashboardCard>

            {/* Financial Information */}
            <DashboardCard title="Financial Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Initial Contract Cost (KSh) *
                  </label>
                  <input
                    type="number"
                    value={formData.initial_contract_cost}
                    onChange={(e) => handleInputChange('initial_contract_cost', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Extension Cost (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.extend_cost}
                    onChange={(e) => handleInputChange('extend_cost', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Total Contract Value (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.total_contract_value}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated (Initial + Extension)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Deposit (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.security_deposit}
                    onChange={(e) => handleInputChange('security_deposit', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Amount Paid (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => handleInputChange('amount_paid', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Balance Due (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.balance_due}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Excess Value (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.excess_value}
                    onChange={(e) => handleInputChange('excess_value', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Client liability excess</p>
                </div>
              </div>
            </DashboardCard>

            {/* Additional Information */}
            <DashboardCard title="Additional Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: colors.borderLight }}
                    rows={3}
                    placeholder="General contract notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Damage Notes
                  </label>
                  <textarea
                    value={formData.damage_notes}
                    onChange={(e) => handleInputChange('damage_notes', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ borderColor: colors.borderLight }}
                    rows={2}
                    placeholder="Pre-existing damage details (if any)..."
                  />
                </div>
              </div>
            </DashboardCard>
          </div>


          {/* Right Column - Signatures */}
          <div className="space-y-6">
            <DashboardCard title="Signatures">
              <div className="space-y-6">
                <SignaturePad
                  label="Client Signature"
                  value={formData.client_signature}
                  onChange={(base64) => handleSignatureChange('client_signature', base64)}
                />

                <SignaturePad
                  label="Driver Signature"
                  value={formData.driver_signature}
                  onChange={(base64) => handleSignatureChange('driver_signature', base64)}
                />

                <SignaturePad
                  label="Creator Signature (Staff/Admin)"
                  value={formData.creator_signature}
                  onChange={(base64) => handleSignatureChange('creator_signature', base64)}
                />
              </div>
            </DashboardCard>
          </div>
        </div>
      </form>
    </motion.div>
  )
}