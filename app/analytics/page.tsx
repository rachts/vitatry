"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Users, Package, Heart } from "lucide-react"

interface AnalyticsData {
  totalDonations: number
  totalVolunteers: number
  medicinesDistributed: number
  livesImpacted: number
  donationTrends: Array<{ month: string; donations: number; volunteers: number }>
  topMedicines: Array<{ name: string; count: number }>
  impactMetrics: {
    co2Saved: number
    wasteReduced: number
    communitiesServed: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading analytics...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Failed to load analytics</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-[#f8faff]">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#1a472a] mb-8">Impact Analytics</h1>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Package className="h-4 w-4 text-[#2ea043]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2ea043]">{data.totalDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Medicine donations received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
              <Users className="h-4 w-4 text-[#0ea5e9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0ea5e9]">{data.totalVolunteers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Community volunteers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicines Distributed</CardTitle>
              <Heart className="h-4 w-4 text-[#1a472a]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1a472a]">{data.medicinesDistributed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">To communities in need</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#2ea043]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#2ea043]">{data.livesImpacted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">People helped</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">Donation Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.donationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="donations" stroke="#2ea043" strokeWidth={2} />
                  <Line type="monotone" dataKey="volunteers" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1a472a]">Top Donated Medicines</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topMedicines}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2ea043" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1a472a]">Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#2ea043] mb-2">{data.impactMetrics.co2Saved} kg</div>
                <p className="text-sm text-muted-foreground">CO₂ Emissions Saved</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#0ea5e9] mb-2">{data.impactMetrics.wasteReduced} tons</div>
                <p className="text-sm text-muted-foreground">Medical Waste Reduced</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1a472a] mb-2">{data.impactMetrics.communitiesServed}</div>
                <p className="text-sm text-muted-foreground">Communities Served</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
