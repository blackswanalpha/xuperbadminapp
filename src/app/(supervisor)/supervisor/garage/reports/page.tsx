'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchInventoryReports, fetchPartsConsumptionReport, fetchVehicleUtilizationReport } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function GarageReportsPage() {
    const [loading, setLoading] = useState(true)
    const [utilizationData, setUtilizationData] = useState<any>(null)
    const [consumptionData, setConsumptionData] = useState<any>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [utilization, consumption] = await Promise.all([
                    fetchVehicleUtilizationReport(), // Assuming these exist returning mocked or real data
                    fetchPartsConsumptionReport()
                ])
                setUtilizationData(utilization)
                setConsumptionData(consumption)
            } catch (error) {
                console.error('Error loading reports:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <div className="p-8">Loading reports...</div>

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Garage Reports</h2>
            </div>

            <Tabs defaultValue="consumption" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="consumption">Parts Consumption</TabsTrigger>
                    <TabsTrigger value="utilization">Vehicle Service Utilization</TabsTrigger>
                </TabsList>

                <TabsContent value="consumption" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Consumed Parts</CardTitle>
                            <CardDescription>Most frequently used parts in the garage.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            {/* Placeholder Chart */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={consumptionData?.top_parts || []}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="quantity_used" fill="#8884d8" name="Quantity Used" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="utilization" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Frequency</CardTitle>
                            <CardDescription>Number of services per vehicle type.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={utilizationData?.utilization_by_type || []}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="service_count" fill="#82ca9d" name="Service Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    )
}
