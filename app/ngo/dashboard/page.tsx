"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Package, Users, MapPin, Calendar } from "lucide-react"

interface MedicineRequest {
  id: string
  medicineType: string
  quantity: number
  urgency: "low" | "medium" | "high"
  reason: string
  status: "pending" | "approved" | "fulfilled" | "rejected"
  requestedAt: string
  location: string
}

interface AvailableMedicine {
  id: string
  name: string
  quantity: number
  expiryDate: string
  location: string
  donorId: string
}

export default function NGODashboard() {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<MedicineRequest[]>([])
  const [availableMedicines, setAvailableMedicines] = useState<AvailableMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (session?.user?.role === "ngo_partner") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [requestsRes, medicinesRes] = await Promise.all([
        fetch("/api/ngo/requests"),
        fetch("/api/ngo/available-medicines"),
      ])

      const requestsData = await requestsRes.json()
      const medicinesData = await medicinesRes.json()

      setRequests(requestsData.requests || [])
      setAvailableMedicines(medicinesData.medicines || [])
    } catch (error) {
      console.error("Failed to fetch NGO data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const submitRequest = async (formData: FormData) => {
    try {
      const data = Object.fromEntries(formData)
      const response = await fetch("/api/ngo/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medicine request submitted successfully",
        })
        fetchData()
      } else {
        throw new Error("Failed to submit request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      })
    }
  }

  const requestMedicine = async (medicineId: string, quantity: number) => {
    try {
      const response = await fetch("/api/ngo/request-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, quantity }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medicine request submitted",
        })
        fetchData()
      } else {
        throw new Error("Failed to request medicine")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request medicine",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== "ngo_partner") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Access denied. This dashboard is only available for NGO partners.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "fulfilled":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-[#1a472a] mb-8">NGO Partner Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Package className="h-4 w-4 text-[#2ea043]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2ea043]">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled Requests</CardTitle>
            <Users className="h-4 w-4 text-[#0ea5e9]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0ea5e9]">
              {requests.filter((r) => r.status === "fulfilled").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Medicines</CardTitle>
            <MapPin className="h-4 w-4 text-[#1a472a]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1a472a]">{availableMedicines.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-[#2ea043]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2ea043]">
              {requests.filter((r) => new Date(r.requestedAt).getMonth() === new Date().getMonth()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available Medicines</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="new-request">New Request</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1a472a]">Available Verified Medicines</h2>
          <div className="grid gap-4">
            {availableMedicines.map((medicine) => (
              <Card key={medicine.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {medicine.quantity} • Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Location: {medicine.location}</p>
                    </div>
                    <Button
                      onClick={() => requestMedicine(medicine.id, medicine.quantity)}
                      className="bg-[#2ea043] hover:bg-[#2ea043]/90"
                    >
                      Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {availableMedicines.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No medicines currently available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1a472a]">My Medicine Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{request.medicineType}</h3>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {request.quantity} • Location: {request.location}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getUrgencyColor(request.urgency)}>{request.urgency}</Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No requests yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new-request" className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1a472a]">Submit New Medicine Request</h2>
          <Card>
            <CardContent className="pt-6">
              <form action={submitRequest} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicineType">Medicine Type</Label>
                    <Input id="medicineType" name="medicineType" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity Needed</Label>
                    <Input id="quantity" name="quantity" type="number" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <select
                      id="urgency"
                      name="urgency"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Delivery Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Please explain why you need these medicines and how they will be used"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#2ea043] hover:bg-[#2ea043]/90">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
