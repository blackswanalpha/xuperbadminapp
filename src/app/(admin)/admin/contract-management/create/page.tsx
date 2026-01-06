'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchVehicles, fetchUsers } from '@/lib/api'
import api from '@/lib/axios'

export default function CreateContractPage() {
  const router = useRouter()

  const [vehicles, setVehicles] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    contract_number: '',
    client: '',
    vehicle: '',
    start_date: '',
    end_date: '',
    status: 'PENDING',
    contract_type: 'MONTHLY',
    total_contract_value: '',
    amount_paid: '0',
    balance_due: '',
    security_deposit: '',
    driver_name: '',
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load vehicles and clients
        const [vehiclesData, clientsData] = await Promise.all([
          fetchVehicles(1, 1000),
          fetchUsers()
        ])

        setVehicles(vehiclesData.vehicles)
        setClients((clientsData.results || []).filter(user => user.role === 'Client'))

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

    // Auto-calculate balance due when total value or amount paid changes
    if (field === 'total_contract_value' || field === 'amount_paid') {
      const totalValue = field === 'total_contract_value' ? parseFloat(value) || 0 : parseFloat(formData.total_contract_value) || 0
      const amountPaid = field === 'amount_paid' ? parseFloat(value) || 0 : parseFloat(formData.amount_paid) || 0
      const balanceDue = Math.max(0, totalValue - amountPaid)

      setFormData(prev => ({
        ...prev,
        balance_due: balanceDue.toString()
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const createData = {
        contract_number: formData.contract_number,
        client: parseInt(formData.client),
        vehicle: parseInt(formData.vehicle),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        contract_type: formData.contract_type,
        total_contract_value: formData.total_contract_value,
        amount_paid: formData.amount_paid,
        balance_due: formData.balance_due,
        security_deposit: formData.security_deposit || null,
        driver_name: formData.driver_name,
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
              </div>
            </DashboardCard>

            {/* Financial Information */}
            <DashboardCard title="Financial Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                    Total Contract Value (KSh) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_contract_value}
                    onChange={(e) => handleInputChange('total_contract_value', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    required
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
                  <p className="text-xs text-gray-500 mt-1">Automatically calculated</p>
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
              </div>
            </DashboardCard>

            {/* Vehicle & Driver Information */}
            <DashboardCard title="Vehicle & Driver Information">
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
                    Driver Name
                  </label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => handleInputChange('driver_name', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: colors.borderLight }}
                    placeholder="Enter driver name"
                  />
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Client Information */}
          <div className="space-y-6">
            <DashboardCard title="Client Information">
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
            </DashboardCard>
          </div>
        </div>
      </form>
    </motion.div>
  )
}