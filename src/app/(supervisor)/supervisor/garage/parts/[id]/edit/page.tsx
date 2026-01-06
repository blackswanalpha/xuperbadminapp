'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchPart, updatePart, fetchPartCategories, fetchSuppliers, Part, PartCategory } from '@/lib/api'
import { Supplier } from '@/types/common'
import { ArrowLeft, Package, Edit } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import { colors } from '@/lib/theme/colors'
import { motion } from 'framer-motion'

export default function EditPartPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const partId = params.id as string
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [categories, setCategories] = useState<PartCategory[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [originalPart, setOriginalPart] = useState<Part | null>(null)
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category: '',
        unit: 'PIECE' as 'PIECE' | 'SET' | 'LITER' | 'KILOGRAM' | 'METER' | 'PAIR',
        current_stock: 0,
        min_stock_level: 0,
        max_stock_level: 0,
        unit_cost: '',
        selling_price: '',
        supplier: '',
        location: ''
    })

    useEffect(() => {
        const loadData = async () => {
            if (!partId) return

            try {
                const [partResult, categoriesResult, suppliersResult] = await Promise.all([
                    fetchPart(partId),
                    fetchPartCategories(),
                    fetchSuppliers()
                ])

                setOriginalPart(partResult)
                setCategories(categoriesResult.results || [])
                setSuppliers(suppliersResult.results || [])

                // Populate form with existing data
                setFormData({
                    sku: partResult.sku,
                    name: partResult.name,
                    description: partResult.description,
                    category: partResult.category ? partResult.category.toString() : '',
                    unit: partResult.unit,
                    current_stock: partResult.current_stock,
                    min_stock_level: partResult.min_stock_level,
                    max_stock_level: partResult.max_stock_level,
                    unit_cost: partResult.unit_cost,
                    selling_price: partResult.selling_price || '',
                    supplier: partResult.supplier ? partResult.supplier.toString() : '',
                    location: partResult.location || ''
                })
            } catch (error) {
                console.error('Error loading data:', error)
                toast({
                    title: "Error",
                    description: "Failed to load part data. Please try again.",
                    variant: "destructive"
                })
            } finally {
                setLoadingData(false)
            }
        }
        loadData()
    }, [partId, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const submitData = {
                ...formData,
                category: formData.category ? Number(formData.category) : null,
                supplier: formData.supplier ? Number(formData.supplier) : null,
                selling_price: formData.selling_price || null,
                location: formData.location || null
            }

            await updatePart(partId, submitData)
            toast({
                title: "Success",
                description: "Part updated successfully",
            })
            router.push('/supervisor/garage/parts')
        } catch (error: any) {
            console.error('Error updating part:', error)
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to update part. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        )
    }

    if (!originalPart) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Part Not Found</h3>
                        <p className="text-gray-500">The part you're looking for doesn't exist.</p>
                        <Link href="/supervisor/garage/parts" className="mt-4 inline-block">
                            <Button variant="outline">Back to Parts</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 space-y-6 p-4 md:p-8 pt-6"
        >
            <div className="flex items-center space-x-2">
                <Link href="/supervisor/garage/parts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${colors.supervisorPrimary}20` }}
                    >
                        <Edit size={20} style={{ color: colors.supervisorPrimary }} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                            Edit Part
                        </h2>
                        <p style={{ color: colors.textSecondary }}>
                            Update part information: {originalPart.name}
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle style={{ color: colors.textPrimary }}>Part Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU / Part Number</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    placeholder="e.g., BRK001, OIL-5W30-001"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Part Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Brake Pad Set, Engine Oil"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    name="category"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category (Optional)</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit">Unit</Label>
                                <select
                                    id="unit"
                                    name="unit"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={formData.unit}
                                    onChange={handleChange}
                                >
                                    <option value="PIECE">Piece</option>
                                    <option value="SET">Set</option>
                                    <option value="LITER">Liter</option>
                                    <option value="KILOGRAM">Kilogram</option>
                                    <option value="METER">Meter</option>
                                    <option value="PAIR">Pair</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detailed description of the part..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_stock">Current Stock</Label>
                                <Input
                                    id="current_stock"
                                    name="current_stock"
                                    type="number"
                                    min="0"
                                    value={formData.current_stock}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                                <Input
                                    id="min_stock_level"
                                    name="min_stock_level"
                                    type="number"
                                    min="0"
                                    value={formData.min_stock_level}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
                                <Input
                                    id="max_stock_level"
                                    name="max_stock_level"
                                    type="number"
                                    min="0"
                                    value={formData.max_stock_level}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="unit_cost">Unit Cost (KES)</Label>
                                <Input
                                    id="unit_cost"
                                    name="unit_cost"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.unit_cost}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="selling_price">Selling Price (KES)</Label>
                                <Input
                                    id="selling_price"
                                    name="selling_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    placeholder="0.00 (Optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Supplier</Label>
                                <select
                                    id="supplier"
                                    name="supplier"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Supplier (Optional)</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Storage Location</Label>
                                <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g., Warehouse A, Shelf B3"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: colors.supervisorPrimary }}
                                className="text-white hover:opacity-90"
                            >
                                {loading ? 'Updating Part...' : 'Update Part'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}