'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Plus, Trash2, Eye, Edit } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchAllContracts, deleteContract, Contract } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ContractApprovalsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'ALL'>('PENDING')

  const loadContracts = async () => {
    setLoading(true)
    try {
      const data = await fetchAllContracts()
      setContracts(data)
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [])

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch =
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.client?.email && contract.client.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === 'ALL') return matchesSearch;
    return matchesSearch && contract.status === activeTab;
  })

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      try {
        await deleteContract(id)
        setContracts(contracts.filter(c => c.id !== id))
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Failed to delete contract')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Contract Approvals
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Review and manage contract requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          {/* TODO: Add create contract button if needed */}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['PENDING', 'ACTIVE', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} Contracts
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      <DashboardCard title={`${activeTab === 'ALL' ? 'All' : activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Contracts`} subtitle={`${filteredContracts.length} contracts found`}>
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading contracts...</div>
          ) : filteredContracts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contracts found</div>
          ) : (
            filteredContracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all bg-white"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText size={20} style={{ color: colors.supervisorPrimary }} />
                      <h3 className="font-semibold text-lg" style={{ color: colors.textPrimary }}>
                        {contract.contract_number}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${contract.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 block">Client</span>
                        <span className="font-medium text-gray-900">
                          {contract.client_name || contract.client?.email || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Amount</span>
                        <span className="font-medium text-gray-900">
                          KSh {parseFloat(contract.total_contract_value).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Date</span>
                        <span className="font-medium text-gray-900">
                          {new Date(contract.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/supervisor/contract-approvals/${contract.id}`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </Link>
                    {/* Placeholder for edit action - for now just navigation or simple alert */}
                    <button
                      onClick={() => router.push(`/supervisor/contract-approvals/${contract.id}`)} // Navigate to details for editing
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Contract"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(contract.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Contract"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </DashboardCard>
    </motion.div>
  )
}