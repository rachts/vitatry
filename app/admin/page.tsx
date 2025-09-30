"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle, Heart, Leaf, Award } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalDonations: number
    totalUsers: number
    totalVolunteers: number
    recentDonations: number
    growthRate: number
  }
  donationsByStatus: {
    pending: number
    approved: number
    rejected: number
    distributed: number
  }
  impactMetrics: {
    livesHelped: number
    co2Saved: number
    wasteReduced: number
    uniqueMedicines: number
  }
  topMedicines: Array<{
    _id: string
    count: number
    donations: number
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user || session.user.role !== "admin") {
      redirect("/")
    }

    fetchAnalytics()
    checkSystemHealth()
  }, [session, status])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics/dashboard")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkSystemHealth = async () => {
    try {
      const response = await fetch("/api/system/health")
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data)
      }
    } catch (error) {
      console.error("Error checking system health:", error)
    }
  }

  const initializeSystem = async () => {
    try {
      const response = await fetch("/api/system/init", { method: "POST" })
      if (response.ok) {
        alert("System initialized successfully!")
        checkSystemHealth()
      } else {
        alert("Failed to initialize system")
      }
    } catch (error) {
      console.error("Error initializing system:", error)
      alert("Error initializing system")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage VitaMend platform and monitor system health</p>
        </div>
        <Button onClick={initializeSystem} variant="outline">
          Initialize System
        </Button>
      </div>

      {/* System Health Status */}
      {systemStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {systemStatus.status === "ok" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <Badge variant={systemStatus.services.database.status === "healthy" ? "default" : "destructive"}>
                  {systemStatus.services.database.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Environment</p>
                <Badge variant="outline">{systemStatus.services.environment.nodeEnv}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">MongoDB</p>
                <Badge
                  variant={systemStatus.services.environment.mongoUri === "configured" ? "default" : "destructive"}
                >
                  {systemStatus.services.environment.mongoUri}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blob Storage</p>
                <Badge
                  variant={systemStatus.services.environment.blobToken === "configured" ? "default" : "destructive"}
                >
                  {systemStatus.services.environment.blobToken}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalDonations}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.overview.recentDonations} this period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalVolunteers}</div>
                  <p className="text-xs text-muted-foreground">Active volunteers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.overview.growthRate > 0 ? "+" : ""}
                    {analytics.overview.growthRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">vs previous period</p>
                </CardContent>
              </Card>
            </div>

            {/* Donation Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Status</CardTitle>
                <CardDescription>Current status of all donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.pending || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.approved || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.rejected || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Distributed</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.distributed || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lives Helped</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.impactMetrics.livesHelped}</div>
                  <p className="text-xs text-muted-foreground">Estimated beneficiaries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                  <Leaf className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.impactMetrics.co2Saved} kg</div>
                  <p className="text-xs text-muted-foreground">Carbon footprint reduced</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waste Reduced</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.impactMetrics.wasteReduced} kg</div>
                  <p className="text-xs text-muted-foreground">Medical waste prevented</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Medicines</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.impactMetrics.uniqueMedicines}</div>
                  <p className="text-xs text-muted-foreground">Different medicine types</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Medicines */}
            <Card>
              <CardHeader>
                <CardTitle>Top Donated Medicines</CardTitle>
                <CardDescription>Most frequently donated medicines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topMedicines.slice(0, 5).map((medicine, index) => (
                    <div key={medicine._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{medicine._id}</p>
                          <p className="text-sm text-gray-600">{medicine.donations} donations</p>
                        </div>
                      </div>
                      <Badge variant="outline">{medicine.count} units</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
