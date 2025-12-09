'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, XCircle, Trash2, Edit, Save, X } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchVehicleContracts, updateContract, deleteContract, Contract } from '@/lib/api' // Note: need to fetch specific contract, reusing fetchVehicleContracts is not right, need fetchContract by ID. 
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/axios' // Direct axios usage for fetching single contract if API method missing

export default function ContractDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [contract, setContract] = useState<Contract | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<Partial<Contract>>({})

    useEffect(() => {
        const loadContract = async () => {
            try {
                // We added fetchAllContracts but not fetchContract(id) to api.ts properly yet? 
                // Actually api.ts has fetchVehicleContracts but not fetchOne.
                // I'll assume we can use the same endpoint with filter or just implement a quick fetch here until I fix api.ts
                // Actually, looking at api.ts, I didn't add fetchContract(id). I'll add it or use direct call.
                const response = await api.get(`/contracts/${id}/`)
                setContract(response.data)
                setEditForm(response.data)
            } catch (error) {
                console.error('Error loading contract:', error)
            } finally {
                setLoading(false)
            }
        }
        loadContract()
    }, [id])

    const handleApprove = async () => {
        if (!contract) return
        if (window.confirm('Approve this contract?')) {
            try {
                await updateContract(contract.id, { status: 'ACTIVE' })
                setContract({ ...contract, status: 'ACTIVE' })
            } catch (e) {
                console.error(e)
                alert('Failed to approve')
            }
        }
    }

    const handleReject = async () => {
        if (!contract) return
        if (window.confirm('Reject this contract?')) {
            try {
                await updateContract(contract.id, { status: 'CANCELLED' }) // Or REJECTED if valid status
                setContract({ ...contract, status: 'CANCELLED' })
            } catch (e) {
                console.error(e)
                alert('Failed to reject')
            }
        }
    }

    const handleDelete = async () => {
        if (!contract) return
        if (window.confirm('Delete this contract?')) {
            try {
                await deleteContract(contract.id)
                router.push('/supervisor/contract-approvals')
            } catch (e) {
                console.error(e)
                alert('Failed to delete')
            }
        }
    }

    const handleSave = async () => {
        if (!contract) return
        try {
            const updated = await updateContract(contract.id, editForm)
            setContract(updated)
            setIsEditing(false)
        } catch (e) {
            console.error(e)
            alert('Failed to save changes')
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!contract) return <div className="p-8 text-center">Contract not found</div>

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
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
                            Contract #{contract.contract_number}
                        </h1>
                        <div className="flex gap-3 items-center">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${contract.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {contract.status}
                            </span>
                            <span className="text-gray-500 text-sm">Created on {new Date(contract.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                                <Edit size={18} />
                                Edit
                            </button>
                        )}
                        {isEditing && (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                                >
                                    <Save size={18} />
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditForm(contract)
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                    Cancel
                                </button>
                            </>
                        )}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Contract Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Total Contract Value</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={editForm.total_contract_value}
                                        onChange={e => setEditForm({ ...editForm, total_contract_value: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-lg font-semibold">KSh {parseFloat(contract.total_contract_value).toLocaleString()}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Balance Due</label>
                                <p className="text-lg font-semibold text-red-600">KSh {parseFloat(contract.balance_due).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded"
                                        value={editForm.start_date?.split('T')[0]}
                                        onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium">{new Date(contract.start_date).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        className="w-full p-2 border rounded"
                                        value={editForm.end_date?.split('T')[0]}
                                        onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium">{new Date(contract.end_date).toLocaleDateString()}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                                {isEditing ? (
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={editForm.status}
                                        onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                ) : (
                                    <p className="font-medium">{contract.status}</p>
                                )}
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Vehicle & Driver">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle</label>
                                <p className="font-medium">ID: #{contract.vehicle}</p>
                                {/* Ideally we fetch vehicle details */}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Driver Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={editForm.driver_name}
                                        onChange={e => setEditForm({ ...editForm, driver_name: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium">{contract.driver_name}</p>
                                )}
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="space-y-6">
                    <DashboardCard title="Client Information">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                                <p className="font-medium">{contract.client?.first_name ? `${contract.client.first_name} ${contract.client.last_name || ''}` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                <p className="font-medium">{contract.client?.email}</p>
                            </div>
                        </div>
                    </DashboardCard>

                    {contract.status === 'PENDING' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-semibold mb-4">Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-white w-full"
                                    style={{ backgroundColor: colors.supervisorAccent }}
                                >
                                    <CheckCircle size={18} />
                                    Approve Contract
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors text-white w-full"
                                    style={{ backgroundColor: colors.adminError }}
                                >
                                    <XCircle size={18} />
                                    Reject Contract
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
