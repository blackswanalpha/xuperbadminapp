'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchJobCard, updateJobCard, JobCard } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function EditJobCardPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<any>({
        client_name: '',
        client_phone: '',
        client_email: '',
        registration_number: '',
        make: '',
        model: '',
        speedometer_reading: '',
        fuel_tank_level: '',
        estimated_cost: 0,
        status: '',
        payment_status: ''
    })

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const data = await fetchJobCard(Number(id))
                setFormData({
                    client_name: data.client_name,
                    client_phone: data.client_phone,
                    client_email: data.client_email,
                    registration_number: data.registration_number,
                    make: data.make,
                    model: data.model,
                    speedometer_reading: data.speedometer_reading,
                    fuel_tank_level: data.fuel_tank_level,
                    estimated_cost: data.estimated_cost,
                    status: data.status,
                    payment_status: data.payment_status
                })
            } catch (error) {
                console.error('Error loading job card:', error)
                toast({
                    title: "Error",
                    description: "Failed to load Job Card details.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, toast])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateJobCard(Number(id), formData)
            toast({
                title: "Success",
                description: "Job Card updated successfully",
            })
            router.push(`/supervisor/garage/job-cards/${id}`)
        } catch (error) {
            console.error('Error updating job card:', error)
            toast({
                title: "Error",
                description: "Failed to update Job Card. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Link href={`/supervisor/garage/job-cards/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Edit Job Card</h2>
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
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    name="status"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="pending_approval">Pending Approval</option>
                                    <option value="started">Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
