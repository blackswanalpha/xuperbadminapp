'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, FileText, Calendar, DollarSign, User, Car, Phone, Mail, MapPin } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchVehicle, Contract, deleteContract, fetchVehicles, fetchUsers } from '@/lib/api'
import api from '@/lib/axios'

export default function ContractDetailPage() {
  const router = useRouter()
  const params = useParams()
  const contractId = params.id as string

  const [contract, setContract] = useState<Contract | null>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [staffName, setStaffName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    const loadContractDetails = async () => {
      try {
        // Fetch contract details
        const response = await api.get(`/contracts/${contractId}/`)
        const contractData = response.data
        setContract(contractData)

        // Fetch vehicle details if vehicle ID exists
        if (contractData.vehicle) {
          try {
            const vehicleData = await fetchVehicle(contractData.vehicle)
            setVehicle(vehicleData)
          } catch (error) {
            console.error('Error fetching vehicle:', error)
          }
        }

        // Fetch staff name if created_by exists
        if (contractData.created_by || contractData.created_by_id) {
          try {
            const userId = contractData.created_by || contractData.created_by_id
            const usersResponse = await fetchUsers()
            const staff = (usersResponse.results || []).find((user: any) => user.id === userId)
            if (staff) {
              setStaffName(staff.name || staff.email || 'Unknown Staff')
            }
          } catch (error) {
            console.error('Error fetching staff details:', error)
          }
        }

      } catch (error) {
        console.error('Error loading contract details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (contractId) {
      loadContractDetails()
    }
  }, [contractId])

  const handleEdit = () => {
    router.push(`/admin/contract-management/${contractId}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        await deleteContract(Number(contractId))
        router.push('/admin/contract-management')
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Failed to delete contract')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return colors.adminSuccess
      case 'PENDING': return colors.adminWarning
      case 'COMPLETED': return colors.textSecondary
      case 'EXPIRED': return colors.adminError
      case 'CANCELLED': return colors.adminError
      default: return colors.textSecondary
    }
  }

  const getClientName = (contract: Contract) => {
    if (contract.client_name) {
      return contract.client_name
    }
    return contract.client?.email || 'Unknown Client'
  }

  const getVehicleName = () => {
    if (vehicle) {
      return `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})`
    }
    return `Vehicle #${contract?.vehicle}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: colors.textSecondary }}>Loading contract details...</div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: colors.adminError }}>Contract not found</div>
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
              Contract {contract.contract_number}
            </h1>
            <div className="flex gap-3 items-center">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${getStatusColor(contract.status)}20`,
                  color: getStatusColor(contract.status),
                }}
              >
                {contract.status.replace('_', ' ')}
              </span>
              <span className="text-gray-500 text-sm">
                Created on {new Date(contract.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Edit size={18} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b" style={{ borderColor: colors.borderLight }}>
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Contract Details', icon: FileText },
              { id: 'extension', label: 'Extension', icon: Calendar },
              { id: 'end', label: 'Contract End', icon: Calendar },
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'payment-record', label: 'Payment Record', icon: DollarSign },
              { id: 'payment-history', label: 'Payment History', icon: DollarSign },
              { id: 'activities', label: 'Activities', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-current'
                      : 'border-transparent hover:text-gray-700'
                    }`}
                  style={{
                    color: activeTab === tab.id ? colors.adminPrimary : colors.textSecondary,
                    borderColor: activeTab === tab.id ? colors.adminPrimary : 'transparent',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Information */}
            <DashboardCard title="Contract Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contract Number</label>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {contract.contract_number}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contract Type</label>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    {contract.contract_type?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {new Date(contract.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {new Date(contract.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Contract Value</label>
                  <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                    KSh {parseFloat(contract.total_contract_value || '0').toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amount Paid</label>
                  <p className="text-lg font-semibold text-green-600">
                    KSh {parseFloat(contract.amount_paid || '0').toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Balance Due</label>
                  <p className="text-lg font-semibold text-red-600">
                    KSh {parseFloat(contract.balance_due || '0').toLocaleString()}
                  </p>
                </div>
                {contract.security_deposit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Security Deposit</label>
                    <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                      KSh {parseFloat(contract.security_deposit).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </DashboardCard>

            {/* Vehicle & Driver Information */}
            <DashboardCard title="Vehicle & Driver Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle</label>
                  <div className="flex items-center gap-3">
                    <Car size={20} style={{ color: colors.adminPrimary }} />
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {getVehicleName()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                  <div className="flex items-center gap-3">
                    <User size={20} style={{ color: colors.adminPrimary }} />
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {contract.driver_name || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Staff Information */}
            <DashboardCard title="Staff Information">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                <div className="flex items-center gap-3">
                  <User size={20} style={{ color: colors.adminPrimary }} />
                  <p className="font-medium" style={{ color: colors.textPrimary }}>
                    {staffName || 'Unknown Staff'}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Client Information */}
          <div className="space-y-6">
            <DashboardCard title="Client Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <div className="flex items-center gap-3">
                    <User size={20} style={{ color: colors.adminPrimary }} />
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {getClientName(contract)}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center gap-3">
                    <Mail size={20} style={{ color: colors.adminPrimary }} />
                    <p className="font-medium" style={{ color: colors.textPrimary }}>
                      {contract.client?.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                {contract.client_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <div className="flex items-center gap-3">
                      <Phone size={20} style={{ color: colors.adminPrimary }} />
                      <p className="font-medium" style={{ color: colors.textPrimary }}>
                        {contract.client_phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {/* Contract Extension Tab */}
      {activeTab === 'extension' && (
        <DashboardCard title="Contract Extension" subtitle="Extend the contract duration and terms">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Current Contract Period</h4>
              <p className="text-blue-800">
                {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  New End Date
                </label>
                <input
                  type="date"
                  min={contract.end_date}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Extension Period
                </label>
                <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ borderColor: colors.borderLight }}>
                  <option value="">Select extension period</option>
                  <option value="1">1 Month</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Additional Amount (KSh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Extension Reason
                </label>
                <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ borderColor: colors.borderLight }}>
                  <option value="">Select reason</option>
                  <option value="client_request">Client Request</option>
                  <option value="business_need">Business Need</option>
                  <option value="operational_requirement">Operational Requirement</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Extension Notes
              </label>
              <textarea
                rows={4}
                placeholder="Add any additional notes about the contract extension..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: colors.adminPrimary }}
              >
                Extend Contract
              </button>
              <button className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Contract End Tab */}
      {activeTab === 'end' && (
        <DashboardCard title="Contract End" subtitle="End the contract and handle final processes">
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Contract Termination</h4>
              <p className="text-yellow-800">
                This action will permanently end the contract. Please ensure all necessary procedures are completed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  End Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  End Reason
                </label>
                <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ borderColor: colors.borderLight }}>
                  <option value="">Select end reason</option>
                  <option value="completed">Contract Completed</option>
                  <option value="early_termination">Early Termination</option>
                  <option value="breach">Contract Breach</option>
                  <option value="mutual_agreement">Mutual Agreement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Final Settlement Amount (KSh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Vehicle Return Status
                </label>
                <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ borderColor: colors.borderLight }}>
                  <option value="">Select status</option>
                  <option value="returned_good">Returned in Good Condition</option>
                  <option value="returned_damaged">Returned with Damages</option>
                  <option value="not_returned">Not Yet Returned</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                End Notes
              </label>
              <textarea
                rows={4}
                placeholder="Add any final notes about the contract ending..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: colors.adminError }}
              >
                End Contract
              </button>
              <button className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Contract Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard title="Financial Summary">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Contract Value</span>
                  <span className="font-semibold" style={{ color: colors.textPrimary }}>
                    KSh {parseFloat(contract.total_contract_value || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    KSh {parseFloat(contract.amount_paid || '0').toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textSecondary }}>Balance Due</span>
                  <span className="font-semibold text-red-600">
                    KSh {parseFloat(contract.balance_due || '0').toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-2" style={{ borderColor: colors.borderLight }}>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: colors.textPrimary }}>Payment Progress</span>
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>
                      {Math.round((parseFloat(contract.amount_paid || '0') / parseFloat(contract.total_contract_value || '1')) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Contract Duration">
              <div className="space-y-4">
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Start Date</span>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {new Date(contract.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>End Date</span>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {new Date(contract.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Duration</span>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {Math.ceil((new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 3600 * 24))} days
                  </p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Status Overview">
              <div className="space-y-4">
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Current Status</span>
                  <div className="mt-1">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${getStatusColor(contract.status)}20`,
                        color: getStatusColor(contract.status),
                      }}
                    >
                      {contract.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Contract Type</span>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {contract.contract_type?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm" style={{ color: colors.textSecondary }}>Created On</span>
                  <p className="font-semibold" style={{ color: colors.textPrimary }}>
                    {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {/* Payment Record Tab */}
      {activeTab === 'payment-record' && (
        <DashboardCard title="Payment Record" subtitle="Record new payments for this contract">
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Outstanding Balance</h4>
              <p className="text-2xl font-bold text-green-800">
                KSh {parseFloat(contract.balance_due || '0').toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Payment Amount (KSh) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  max={contract.balance_due}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Payment Method *
                </label>
                <select className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ borderColor: colors.borderLight }}>
                  <option value="">Select payment method</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CARD">Card Payment</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="Enter transaction ID (optional)"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: colors.borderLight }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Payment Notes
              </label>
              <textarea
                rows={3}
                placeholder="Add any notes about this payment..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: colors.borderLight }}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: colors.adminSuccess }}
              >
                Record Payment
              </button>
              <button className="px-6 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Payment History Tab */}
      {activeTab === 'payment-history' && (
        <DashboardCard title="Payment History" subtitle="View all payments made for this contract">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-blue-600">Total Paid</p>
                  <p className="text-xl font-bold text-blue-900">
                    KSh {parseFloat(contract.amount_paid || '0').toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Outstanding</p>
                  <p className="text-xl font-bold text-blue-900">
                    KSh {parseFloat(contract.balance_due || '0').toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Total Payments</p>
                  <p className="text-xl font-bold text-blue-900">0</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Method
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Transaction ID
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                      No payment history available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <DashboardCard title="Contract Activities" subtitle="Track all activities and changes">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                  <FileText size={16} style={{ color: colors.adminSuccess }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold" style={{ color: colors.textPrimary }}>Contract Created</h4>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Contract {contract.contract_number} was created by {staffName}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(contract.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {contract.status === 'ACTIVE' && (
                <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.adminSuccess}20` }}>
                    <Calendar size={16} style={{ color: colors.adminSuccess }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: colors.textPrimary }}>Contract Activated</h4>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      Contract status changed to Active
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(contract.start_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                No additional activities recorded
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
    </motion.div>
  )
}