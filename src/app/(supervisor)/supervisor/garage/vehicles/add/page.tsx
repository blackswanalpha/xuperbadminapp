'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createVehicle } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function AddCustomerVehiclePage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        registration_number: '',
        make: '',
        model: '',
        color: '',
        vehicle_type: 'sedan',
        classification: 'EXTERNAL', // Default to External for "Customer Vehicle"
        status: 'IN_GARAGE',
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
            await createVehicle(formData)
            toast({
                title: "Success",
                description: "Customer Vehicle added successfully",
            })
            router.push('/supervisor/garage/vehicles')
        } catch (error) {
            console.error('Error creating vehicle:', error)
            toast({
                title: "Error",
                description: "Failed to create vehicle. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href="/supervisor/garage/vehicles">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Add Customer Vehicle</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="registration_number">Registration Number</Label>
                                <Input id="registration_number" name="registration_number" value={formData.registration_number} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="make">Make</Label>
                                <Input id="make" name="make" value={formData.make} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model</Label>
                                <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" name="color" value={formData.color} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vehicle_type">Body Type</Label>
                                <select
                                    id="vehicle_type"
                                    name="vehicle_type"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.vehicle_type}
                                    onChange={handleChange}
                                >
                                    <option value="sedan">Sedan</option>
                                    <option value="suv">SUV</option>
                                    <option value="truck">Truck</option>
                                    <option value="van">Van</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Current Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="IN_GARAGE">In Garage</option>
                                    <option value="AVAILABLE">Available (Released)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                name="notes"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
