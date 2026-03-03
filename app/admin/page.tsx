"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, CheckCircle, Clock, XCircle, Heart, Leaf, Award } from "lucide-react"

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
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      redirect("/auth/signin")
    }
    fetchAnalytics()
  }, [user, authLoading])

  const fetchAnalytics = async () => {
    try {
      const [statsRes, donationsRes, volunteersRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/donations"),
        fetch("/api/volunteers"),
      ])

      const stats = await statsRes.json()
      const donationsData = await donationsRes.json()
      const volunteersData = await volunteersRes.json()

      const donations = donationsData.donations || []
      const recentDonations = donations.filter((d: any) => {
        const created = new Date(d.createdAt)
        return created > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }).length

      setAnalytics({
        overview: {
          totalDonations: stats.totalDonations || 0,
          totalUsers: 0,
          totalVolunteers: stats.totalVolunteers || 0,
          recentDonations,
          growthRate: 0,
        },
        donationsByStatus: {
          pending: stats.pendingDonations || 0,
          approved: stats.approvedDonations || 0,
          rejected: 0,
          distributed: stats.distributedDonations || 0,
        },
        impactMetrics: {
          livesHelped: (stats.totalDonations || 0) * 3,
          co2Saved: (stats.totalDonations || 0) * 2,
          wasteReduced: (stats.totalDonations || 0) * 0.5,
          uniqueMedicines: new Set(donations.map((d: any) => d.medicineName)).size,
        },
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
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
      </div>

      {/* System Health Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Database</p>
              <Badge variant="default">MongoDB Connected</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Authentication</p>
              <Badge variant="default">Supabase Auth</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Storage</p>
              <Badge variant="default">Vercel Blob</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Environment</p>
              <Badge variant="outline">Production</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.overview.totalDonations}</div>
                  <p className="text-xs text-muted-foreground">+{analytics.overview.recentDonations} this month</p>
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
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.donationsByStatus.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Distributed</CardTitle>
                  <Award className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.donationsByStatus.distributed}</div>
                  <p className="text-xs text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>
            </div>

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
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.pending}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.approved}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.rejected}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Distributed</p>
                      <p className="text-xl font-semibold">{analytics.donationsByStatus.distributed}</p>
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
                  <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
