'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import SignaturePad from '@/components/shared/signature-pad'
import { colors } from '@/lib/theme/colors'
import { fetchVehicles, fetchUsers } from '@/lib/api'
import api from '@/lib/axios'

export default function CreateContractPage() {
  const router = useRouter()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
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
    status: 'PENDING',
    contract_type: 'MONTHLY',

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
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load vehicles and clients
        const [vehiclesData, usersData] = await Promise.all([
          fetchVehicles(1, 1000),
          fetchUsers()
        ])

        setVehicles(vehiclesData.vehicles)
        const allUsers = usersData.results || []
        setClients(allUsers.filter((user: any) => user.role?.toUpperCase() === 'CLIENT'))
        setDrivers(allUsers.filter((user: any) => user.role?.toUpperCase() === 'DRIVER'))

        // Generate default contract number
        const now = new Date()
        const contractNumber = `CNT-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`
        setFormData(prev => ({
          ...prev,
          contract_number: contractNumber,
          start_date: now.toISOString().split('T')[0]
        }))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-calculate balance due when relevant fields change
    if (['total_contract_value', 'amount_paid', 'initial_contract_cost', 'extend_cost', 'security_deposit'].includes(field)) {
      setTimeout(() => {
        setFormData(prev => {
          const initialCost = parseFloat(prev.initial_contract_cost) || 0
          const extendCost = parseFloat(prev.extend_cost) || 0
          const totalValue = initialCost + extendCost
          const amountPaid = parseFloat(prev.amount_paid) || 0
          const deposit = parseFloat(prev.security_deposit) || 0
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

  const handleSignatureChange = (field: string, base64: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: base64
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const createData = {
        // Contract info
        contract_number: formData.contract_number,
        client: parseInt(formData.client),
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
        total_contract_value: formData.total_contract_value || '0',
        initial_contract_cost: formData.initial_contract_cost || null,
        extend_cost: formData.extend_cost || '0',
        amount_paid: formData.amount_paid || '0',
        balance_due: formData.balance_due || '0',
        security_deposit: formData.security_deposit || null,
        excess_value: formData.excess_value || '0',

        // Additional
        notes: formData.notes || null,
        damage_notes: formData.damage_notes || null,
        purpose: formData.purpose || null,
        checklist: formData.checklist,

        // Signatures
        client_signature: formData.client_signature || null,
        driver_signature: formData.driver_signature || null,
        creator_signature: formData.creator_signature || null,
      }

      const response = await api.post('/contracts/', createData)
      router.push(`/admin/contract-management/${response.data.id}`)
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Failed to create contract')
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
                    onChange={(e) => handleInputChange('contract_number', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Contract Type *
                  </label>
                  <select
                    value={formData.contract_type}
                    onChange={(e) => handleInputChange('contract_type', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
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

            {/* Driver Information */}
            <DashboardCard title="Driver Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Registered Driver (Optional)
                  </label>
                  <select
                    value={formData.driver}
                    onChange={(e) => handleInputChange('driver', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
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
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Full name of driver"
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
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="National ID number"
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
                  <input
                    type="date"
                    value={formData.driving_license_expiry}
                    onChange={(e) => handleInputChange('driving_license_expiry', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
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

            {/* Financial Information */}
            <DashboardCard title="Financial Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Initial Contract Cost (KSh) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
                    value={formData.total_contract_value}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50 cursor-not-allowed"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated (Initial + Extension)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Security Deposit (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
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
                    step="0.01"
                    value={formData.excess_value}
                    onChange={(e) => handleInputChange('excess_value', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Client liability excess</p>
                </div>
              </div>
            </DashboardCard>

            {/* Vehicle & Client Information */}
            <DashboardCard title="Vehicle & Client">
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

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Client *
                  </label>
                  <select
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name || client.last_name
                          ? `${client.first_name || ''} ${client.last_name || ''}`.trim()
                          : client.email
                        }
                      </option>
                    ))}
                  </select>
                  {clients.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No clients available. Create clients first.</p>
                  )}
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