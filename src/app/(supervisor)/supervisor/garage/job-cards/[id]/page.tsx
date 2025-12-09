'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchJobCard, JobCard } from '@/lib/api'
import { ArrowLeft, Edit, Trash, Printer, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

export default function JobCardDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [jobCard, setJobCard] = useState<JobCard | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!id) return
            try {
                const result = await fetchJobCard(Number(id))
                setJobCard(result)
            } catch (error) {
                console.error('Error loading job card:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id])

    if (loading) return <div className="p-8">Loading job card details...</div>
    if (!jobCard) return <div className="p-8">Job Card not found</div>

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{jobCard.job_card_number}</h2>
                        <div className="text-sm text-muted-foreground">{jobCard.client_name} - {jobCard.registration_number}</div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Link href={`/supervisor/garage/job-cards/${id}/edit`}>
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
                        <div className="text-2xl font-bold uppercase">{jobCard.status}</div>
                        <p className="text-xs text-muted-foreground capitalize">
                            {jobCard.payment_status}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {Number(jobCard.total_job_value).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Balance Due: KES {Number(jobCard.balance_due).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="workflow">Services & Defects</TabsTrigger>
                    <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Information</CardTitle>
                            <CardDescription>General information about the job and vehicle.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold">Client Details</h4>
                                    <div className="text-sm mt-1">Name: {jobCard.client_name}</div>
                                    {/* Add other client details if available in API */}
                                </div>
                                <div>
                                    <h4 className="font-semibold">Vehicle Details</h4>
                                    <div className="text-sm mt-1">Reg No: {jobCard.registration_number}</div>
                                    {/* Add other vehicle details if available */}
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold">Job Details</h4>
                                    <div className="text-sm mt-1">Date Created: {new Date(jobCard.date_created).toLocaleDateString()}</div>
                                    <div className="text-sm mt-1">Status: {jobCard.status}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Placeholder contents for other tabs */}
                <TabsContent value="workflow">
                    <Card>
                        <CardHeader><CardTitle>Authorized Services & Defects</CardTitle></CardHeader>
                        <CardContent>Workflow details comng soon</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="parts">
                    <Card>
                        <CardHeader><CardTitle>Parts Used</CardTitle></CardHeader>
                        <CardContent>Parts details coming soon</CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials">
                    <Card>
                        <CardHeader><CardTitle>Payments & Financials</CardTitle></CardHeader>
                        <CardContent>Financial details coming soon</CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    )
}
