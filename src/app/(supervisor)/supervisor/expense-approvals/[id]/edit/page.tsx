'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Car, Tag, Save, Plus, Trash2 } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import { colors } from '@/lib/theme/colors'
import { fetchVehicleExpense, updateVehicleExpense, fetchExpenseItems, ExpenseItem, VehicleExpenseItem } from '@/lib/api'
import { useRouter, useParams } from 'next/navigation'

export default function EditExpensePage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string

    const [expense, setExpense] = useState<VehicleExpenseItem | null>(null)
    const [availableItems, setAvailableItems] = useState<ExpenseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [category, setCategory] = useState('')
    const [vehicleType, setVehicleType] = useState<'External' | 'Internal'>('External')
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'sent'>('pending')
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
    const [customItems, setCustomItems] = useState<{ name: string, cost: number }[]>([])
    const [notes, setNotes] = useState('')

    // Custom item inputs
    const [newItemName, setNewItemName] = useState('')
    const [newItemCost, setNewItemCost] = useState('')

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const expenseData = await fetchVehicleExpense(id)
                setExpense(expenseData)

                // Initialize form state
                setCategory(expenseData.category_name)
                setVehicleType(expenseData.type as 'External' | 'Internal')
                setStatus(expenseData.status as any)
                setNotes(expenseData.notes || '')

                // Load available items for this category
                const items = await fetchExpenseItems(expenseData.category_name)
                setAvailableItems(items)

                // Parse existing items to separate standard vs custom
                const existingItems = expenseData.items || []
                const costs = expenseData.item_costs || {}

                const standardIds = new Set<string>()
                const custom = []

                // Create a map of standard item names to IDs for easier lookup
                const standardItemMap = new Map(items.map(i => [i.name, i.id]))

                for (const itemName of existingItems) {
                    if (standardItemMap.has(itemName)) {
                        standardIds.add(standardItemMap.get(itemName)!)
                    } else {
                        custom.push({
                            name: itemName,
                            cost: Number(costs[itemName] || 0)
                        })
                    }
                }

                setSelectedItemIds(standardIds)
                setCustomItems(custom)

            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    // Reload items if category changes (user interaction)
    const handleCategoryChange = async (newCategory: string) => {
        setCategory(newCategory)
        try {
            const items = await fetchExpenseItems(newCategory)
            setAvailableItems(items)
            // Look up if any previously selected standard items exist in new category
            // But safer to just clear standard selection for new category to avoid ID conflicts
            setSelectedItemIds(new Set())
        } catch (error) {
            console.error("Error fetching items for new category", error)
        }
    }

    const handleToggleItem = (itemId: string) => {
        const newSet = new Set(selectedItemIds)
        if (newSet.has(itemId)) {
            newSet.delete(itemId)
        } else {
            newSet.add(itemId)
        }
        setSelectedItemIds(newSet)
    }

    const handleAddCustomItem = () => {
        if (!newItemName || !newItemCost) return
        setCustomItems([...customItems, { name: newItemName, cost: parseFloat(newItemCost) }])
        setNewItemName('')
        setNewItemCost('')
    }

    const handleRemoveCustomItem = (index: number) => {
        setCustomItems(customItems.filter((_, i) => i !== index))
    }

    const calculateTotal = () => {
        let total = 0
        // Sum selected predefined items
        availableItems.forEach(item => {
            if (selectedItemIds.has(item.id)) {
                total += Number(item.default_cost)
            }
        })
        // Sum custom items
        customItems.forEach(item => {
            total += item.cost
        })
        return total
    }

    const handleSubmit = async () => {
        if (selectedItemIds.size === 0 && customItems.length === 0) {
            alert('Please add at least one expense item')
            return
        }

        setSubmitting(true)

        // Prepare payload
        const itemsList: string[] = []
        const costsMap: Record<string, number> = {}

        availableItems.forEach(item => {
            if (selectedItemIds.has(item.id)) {
                itemsList.push(item.name)
                costsMap[item.name] = Number(item.default_cost)
            }
        })

        customItems.forEach(item => {
            itemsList.push(item.name)
            costsMap[item.name] = item.cost
        })

        try {
            await updateVehicleExpense(id, {
                vehicle_id: expense?.vehicle, // Keep original vehicle ID
                category_name: category,
                type: vehicleType,
                status: status,
                items: itemsList,
                item_costs: costsMap,
                total_amount: calculateTotal(),
                notes: notes
            })
            router.push(`/supervisor/expense-approvals/${id}`)
        } catch (error) {
            console.error('Error updating expense:', error)
            alert('Failed to update expense')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!expense) return <div className="p-8 text-center text-red-500">Expense not found</div>

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
        >
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    Back to Details
                </button>
                <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    Edit Expense
                </h1>
                <p className="text-gray-600">
                    For {expense.vehicle_registration} ({expense.vehicle_make} {expense.vehicle_model})
                </p>
            </div>

            <div className="space-y-6">
                <DashboardCard title="Expense Details">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                        value={category}
                                        onChange={e => handleCategoryChange(e.target.value)}
                                    >
                                        <option value="Service">Service</option>
                                        <option value="Bodywork">Bodywork</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Tyres">Tyres</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                                <div className="flex gap-4">
                                    {['External', 'Internal'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setVehicleType(type as 'External' | 'Internal')}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-all ${vehicleType === type
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {/* Standard Items */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Standard Items</label>
                            {availableItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableItems.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleToggleItem(item.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${selectedItemIds.has(item.id)
                                                ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200'
                                                : 'hover:bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <span className="font-medium text-sm">{item.name}</span>
                                            <span className="text-sm text-gray-500">KSh {Number(item.default_cost).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                                    No standard items available for this category.
                                </div>
                            )}
                        </div>

                        {/* Custom Items */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Custom Items</label>
                            <div className="flex gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="Item Name"
                                    className="flex-1 p-2 border rounded-lg"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Cost"
                                    className="w-32 p-2 border rounded-lg"
                                    value={newItemCost}
                                    onChange={e => setNewItemCost(e.target.value)}
                                />
                                <button
                                    onClick={handleAddCustomItem}
                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {customItems.length > 0 && (
                                <div className="space-y-2">
                                    {customItems.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-gray-600">KSh {item.cost.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleRemoveCustomItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="Summary">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={3}
                                placeholder="Additional notes..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                            <span className="font-semibold text-gray-700">Total Amount</span>
                            <span className="text-2xl font-bold" style={{ color: colors.supervisorPrimary }}>
                                KSh {calculateTotal().toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                style={{ backgroundColor: colors.supervisorPrimary }}
                            >
                                {submitting ? 'Saving...' : (
                                    <>
                                        <Save size={20} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </motion.div>
    )
}
