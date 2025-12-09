'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchVehicle, Vehicle } from '@/lib/api'
import { ArrowLeft, Edit, Trash, Wrench } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export default function GarageVehicleDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const result = await fetchVehicle(Number(id))
                setVehicle(result)
            } catch (error) {
                console.error('Error loading vehicle:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    if (loading) return <div className="p-8">Loading vehicle details...</div>
    if (!vehicle) return <div className="p-8">Vehicle not found</div>

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{vehicle.registration_number}</h2>
                        <div className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model} ({(vehicle as any).year || 'N/A'})</div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/supervisor/garage/vehicles/${id}/edit`}>
                        <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </Link>
                    <Button variant="destructive" size="sm">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold uppercase">{vehicle.status}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold uppercase">{vehicle.classification || 'INTERNAL'}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">Job Cards History</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Information</CardTitle>
                            <CardDescription>Technical and registration details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold">Basic Info</h4>
                                    <div className="text-sm mt-1">Make: {vehicle.make}</div>
                                    <div className="text-sm mt-1">Model: {vehicle.model}</div>
                                    <div className="text-sm mt-1">Color: {vehicle.color || 'N/A'}</div>
                                    <div className="text-sm mt-1">VIN: {vehicle.vin || 'N/A'}</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Notes</h4>
                                    <p className="text-sm mt-1 text-muted-foreground">{vehicle.notes || 'No notes available.'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader><CardTitle>Service History</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center p-8">
                                <Wrench className="h-8 w-8 mb-2 opacity-50" />
                                No job cards found for this vehicle (Feature coming soon to link directly)
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    )
}
