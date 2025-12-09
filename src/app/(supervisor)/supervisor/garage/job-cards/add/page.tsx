'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createJobCard } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function AddJobCardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        client_name: '',
        client_phone: '',
        client_email: '',
        registration_number: '',
        make: '',
        model: '',
        speedometer_reading: '',
        fuel_tank_level: '',
        job_cost: 0,
        estimated_cost: 0,
        status: 'in_progress',
        payment_status: 'pending'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            await createJobCard(formData)
            toast({
                title: "Success",
                description: "Job Card created successfully",
            })
            router.push('/supervisor/garage/job-cards')
        } catch (error) {
            console.error('Error creating job card:', error)
            toast({
                title: "Error",
                description: "Failed to create Job Card. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href="/supervisor/garage/job-cards">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">New Job Card</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Job Card Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="client_name">Client Name</Label>
                                <Input id="client_name" name="client_name" value={formData.client_name} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_phone">Client Phone</Label>
                                <Input id="client_phone" name="client_phone" value={formData.client_phone} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client_email">Client Email</Label>
                                <Input id="client_email" name="client_email" type="email" value={formData.client_email} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration_number">Registration Number</Label>
                                <Input id="registration_number" name="registration_number" value={formData.registration_number} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="make">Car Make</Label>
                                <Input id="make" name="make" value={formData.make} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Car Model</Label>
                                <Input id="model" name="model" value={formData.model} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="speedometer_reading">Speedometer Reading (KM)</Label>
                                <Input id="speedometer_reading" name="speedometer_reading" type="number" value={formData.speedometer_reading} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fuel_tank_level">Fuel Tank Level</Label>
                                <select
                                    id="fuel_tank_level"
                                    name="fuel_tank_level"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.fuel_tank_level}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Level</option>
                                    <option value="E">Empty</option>
                                    <option value="1/4">1/4</option>
                                    <option value="1/2">1/2</option>
                                    <option value="3/4">3/4</option>
                                    <option value="F">Full</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimated_cost">Estimated Cost</Label>
                                <Input id="estimated_cost" name="estimated_cost" type="number" value={formData.estimated_cost} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Job Card'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
