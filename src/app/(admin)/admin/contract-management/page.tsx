'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Search, Filter, Edit, Trash2, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import { fetchAllContracts, deleteContract, Contract, fetchVehicles } from '@/lib/api'
import api from '@/lib/axios'
import { downloadFileFromBlob } from '@/lib/download'

export default function ContractManagementPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [contractsPerPage] = useState(10)

  const stats = [
    {
      title: 'Total Contracts',
      value: contracts.length.toString(),
      icon: FileText,
      trend: { value: '+7', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'Active',
      value: contracts.filter(c => c.status === 'ACTIVE').length.toString(),
      icon: CheckCircle,
      trend: { value: '+5', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Pending',
      value: contracts.filter(c => c.status === 'PENDING').length.toString(),
      icon: Clock,
      trend: { value: '+2', isPositive: false },
      color: colors.adminWarning,
    },
    {
      title: 'Expiring Soon',
      value: contracts.filter(c => {
        const endDate = new Date(c.end_date)
        const today = new Date()
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0
      }).length.toString(),
      icon: AlertCircle,
      trend: { value: '+3', isPositive: false },
      color: colors.adminError,
    },
  ]

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsData, vehiclesData] = await Promise.all([
          fetchAllContracts(),
          fetchVehicles(1, 1000) // Get all vehicles for reference
        ])
        setContracts(contractsData)
        setVehicles(vehiclesData.vehicles)
      } catch (error) {
        console.error('Error loading contracts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Helper function to get vehicle name from ID
  const getVehicleName = (vehicleId: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_number})` : `Vehicle #${vehicleId}`
  }

  // Helper function to get client name from contract
  const getClientName = (contract: Contract) => {
    if (contract.client_name) {
      return contract.client_name
    }
    return contract.client?.email || 'Unknown Client'
  }

  // Filter and search contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !searchTerm || 
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(contract).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getVehicleName(contract.vehicle).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || contract.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Pagination logic
  const indexOfLastContract = currentPage * contractsPerPage
  const indexOfFirstContract = indexOfLastContract - contractsPerPage
  const currentContracts = filteredContracts.slice(indexOfFirstContract, indexOfLastContract)
  const totalPages = Math.ceil(filteredContracts.length / contractsPerPage)

  // Handle actions
  const handleViewContract = (contractId: number) => {
    router.push(`/admin/contract-management/${contractId}`)
  }

  const handleEditContract = (contractId: number) => {
    router.push(`/admin/contract-management/${contractId}/edit`)
  }

  const handleDeleteContract = async (contractId: number) => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        await deleteContract(contractId)
        setContracts(contracts.filter(c => c.id !== contractId))
        alert('Contract deleted successfully')
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Failed to delete contract')
      }
    }
  }

  const handleDownloadContract = async (contractId: number, contractNumber: string) => {
    try {
      const response = await api.get(`/contracts/${contractId}/pdf/`, {
        responseType: 'blob'
      })
      
      downloadFileFromBlob(response.data, `contract_${contractNumber}.pdf`)
    } catch (error) {
      console.error('Error downloading contract:', error)
      alert('Failed to download contract PDF')
    }
  }

  const handleCreateContract = () => {
    router.push('/admin/contract-management/create')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: colors.textSecondary }}>Loading contracts...</div>
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Contract Management
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Manage rental contracts and agreements
            </p>
          </div>
          <button
            onClick={handleCreateContract}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.adminPrimary }}
          >
            <Plus size={20} />
            Create Contract
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <DashboardCard
            title="All Contracts"
            subtitle="Manage rental agreements and contracts"
            action={
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.textTertiary }}
                  />
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{ borderColor: colors.borderLight }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 transition-all text-sm"
                  style={{ borderColor: colors.borderLight }}
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: colors.borderLight }}>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Contract #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Vehicle
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Period
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Value
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm" style={{ color: colors.textSecondary }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentContracts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center" style={{ color: colors.textSecondary }}>
                        {filteredContracts.length === 0 ? 'No contracts found' : 'No contracts found for current page'}
                      </td>
                    </tr>
                  ) : (
                    currentContracts.map((contract, index) => (
                      <motion.tr
                        key={contract.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="border-b hover:bg-gray-50 transition-colors"
                        style={{ borderColor: colors.borderLight }}
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: colors.textPrimary }}>
                          {contract.contract_number}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textPrimary }}>
                          {getClientName(contract)}
                        </td>
                        <td className="py-3 px-4" style={{ color: colors.textSecondary }}>
                          {getVehicleName(contract.vehicle)}
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: colors.textSecondary }}>
                          {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold" style={{ color: colors.textPrimary }}>
                          KSh {parseFloat(contract.total_contract_value || '0').toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getStatusColor(contract.status)}20`,
                              color: getStatusColor(contract.status),
                            }}
                          >
                            {contract.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewContract(contract.id)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} style={{ color: colors.adminPrimary }} />
                            </button>
                            <button
                              onClick={() => handleDownloadContract(contract.id, contract.contract_number)}
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Download PDF"
                            >
                              <Download size={16} style={{ color: colors.adminSuccess }} />
                            </button>
                            <button
                              onClick={() => handleEditContract(contract.id)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit Contract"
                            >
                              <Edit size={16} style={{ color: colors.adminPrimary }} />
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Contract"
                            >
                              <Trash2 size={16} style={{ color: colors.adminError }} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t" style={{ borderColor: colors.borderLight }}>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Showing {indexOfFirstContract + 1} to {Math.min(indexOfLastContract, filteredContracts.length)} of {filteredContracts.length} contracts
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                    style={{ borderColor: colors.borderLight, color: currentPage === 1 ? undefined : colors.textPrimary }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'text-white'
                              : 'bg-white border hover:bg-gray-50'
                          }`}
                          style={{
                            backgroundColor: currentPage === pageNumber ? colors.adminPrimary : undefined,
                            borderColor: currentPage === pageNumber ? colors.adminPrimary : colors.borderLight,
                            color: currentPage === pageNumber ? undefined : colors.textPrimary
                          }}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                    style={{ borderColor: colors.borderLight, color: currentPage === totalPages ? undefined : colors.textPrimary }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </DashboardCard>
        </motion.div>
      </motion.div>
    
  )
}

