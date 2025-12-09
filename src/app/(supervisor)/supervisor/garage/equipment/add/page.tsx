'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createEquipment } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function AddEquipmentPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        purchase_date: '',
        cost: 0,
        condition: 'GOOD',
        status: 'AVAILABLE',
        notes: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createEquipment({
                ...formData,
                condition: formData.condition as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED',
                status: formData.status as 'MAINTENANCE' | 'AVAILABLE' | 'IN_USE' | 'RETIRED'
            })
            toast({
                title: "Success",
                description: "Equipment added successfully",
            })
            router.push('/supervisor/garage/equipment')
        } catch (error) {
            console.error('Error creating equipment:', error)
            toast({
                title: "Error",
                description: "Failed to create equipment. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href="/supervisor/garage/equipment">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Add Equipment</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Equipment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serial_number">Serial Number</Label>
                                <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purchase_date">Purchase Date</Label>
                                <Input id="purchase_date" name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost</Label>
                                <Input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="condition">Condition</Label>
                                <select
                                    id="condition"
                                    name="condition"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >
                                    <option value="EXCELLENT">Excellent</option>
                                    <option value="GOOD">Good</option>
                                    <option value="FAIR">Fair</option>
                                    <option value="POOR">Poor</option>
                                    <option value="DAMAGED">Damaged</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="IN_USE">In Use</option>
                                    <option value="MAINTENANCE">Under Maintenance</option>
                                    <option value="RETIRED">Retired</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Add Equipment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
