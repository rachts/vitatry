"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shell } from "@/components/shell"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, Heart, Pill, Users, Award, Package, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface Donation {
  _id: string
  donationId: string
  medicineName: string
  quantity: number
  status: "pending" | "verified" | "distributed" | "rejected"
  createdAt: string
  expiryDate: string
}

interface DashboardData {
  stats: {
    donations: number
    medicinesVerified: number
    livesHelped: number
    impactScore: number
  }
  myDonations: Donation[]
  activeDonations: Donation[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  distributed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusIcons = {
  pending: Clock,
  verified: CheckCircle,
  distributed: Package,
  rejected: XCircle,
}

const statColorMap: Record<string, { icon: string; bg: string }> = {
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  purple: { icon: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  orange: { icon: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
}

const quickActions = [
  { href: "/donate", icon: Heart, color: "emerald", title: "Donate Medicines", desc: "Help someone in need" },
  { href: "/volunteer", icon: Users, color: "blue", title: "Become Volunteer", desc: "Join our team" },
  { href: "/shop", icon: Pill, color: "purple", title: "Browse Shop", desc: "Support our mission" },
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<DashboardData>({
    stats: { donations: 0, medicinesVerified: 0, livesHelped: 0, impactScore: 0 },
    myDonations: [],
    activeDonations: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/dashboard")
    }
  }, [status])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard")
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  if (status === "loading" || loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading your dashboard...</p>
        </div>
      </Shell>
    )
  }

  if (!session) {
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const safeStats = {
    donations: data?.stats?.donations ?? 0,
    medicinesVerified: data?.stats?.medicinesVerified ?? 0,
    livesHelped: data?.stats?.livesHelped ?? 0,
    impactScore: data?.stats?.impactScore ?? 0,
  }

  const statsConfig = [
    { title: "Total Donations", value: safeStats.donations, icon: Heart, color: "emerald", suffix: "" },
    { title: "Medicines Verified", value: safeStats.medicinesVerified, icon: Pill, color: "blue", suffix: "" },
    { title: "Lives Helped", value: safeStats.livesHelped, icon: Users, color: "purple", suffix: "" },
    { title: "Impact Score", value: safeStats.impactScore, icon: Award, color: "orange", suffix: " pts" },
  ]

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Welcome back, {session?.user?.name || "User"}!</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="transition-smooth hover-scale bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 transition-smooth hover-lift">
              <Link href="/donate">
                <Icons.plus className="h-4 w-4 mr-2" />
                New Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions - Use explicit color classes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Button
              key={action.href}
              asChild
              variant="outline"
              className="h-auto p-6 flex flex-col items-start justify-start dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent transition-smooth hover-lift animate-fade-in-up"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <Link href={action.href}>
                <action.icon className={`h-6 w-6 mb-2 ${statColorMap[action.color]?.icon || "text-emerald-600"}`} />
                <span className="font-semibold text-left">{action.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</span>
              </Link>
            </Button>
          ))}
        </div>

        {/* Stats Cards - Use explicit color classes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsConfig.map((stat, idx) => (
            <Card
              key={stat.title}
              className="dark:border-slate-800 dark:bg-slate-900 transition-smooth hover-lift animate-fade-in-up"
              style={{ animationDelay: `${(idx + 4) * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${statColorMap[stat.color]?.icon || "text-emerald-600"}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">
                  {stat.value}
                  {stat.suffix}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="my-donations" className="space-y-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <TabsList className="dark:bg-slate-900 dark:border-slate-800 grid w-full grid-cols-3">
            <TabsTrigger value="my-donations" className="transition-smooth">
              My Donations
            </TabsTrigger>
            <TabsTrigger value="active-donations" className="transition-smooth">
              Active Donations
            </TabsTrigger>
            <TabsTrigger value="settings" className="transition-smooth">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* My Donations Tab */}
          <TabsContent value="my-donations" className="space-y-6">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Your Donations</CardTitle>
                <CardDescription>All medicines you have donated to the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {data.myDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 mb-4">You haven&apos;t made any donations yet.</p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 transition-smooth hover-lift">
                      <Link href="/donate">
                        Make Your First Donation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medicine</TableHead>
                          <TableHead className="hidden sm:table-cell">Quantity</TableHead>
                          <TableHead className="hidden md:table-cell">Donated On</TableHead>
                          <TableHead className="hidden md:table-cell">Expiry</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.myDonations.map((donation) => {
                          const StatusIcon = statusIcons[donation.status]
                          return (
                            <TableRow
                              key={donation._id}
                              className="transition-smooth hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <TableCell className="font-medium">{donation.medicineName}</TableCell>
                              <TableCell className="hidden sm:table-cell">{donation.quantity}</TableCell>
                              <TableCell className="hidden md:table-cell">{formatDate(donation.createdAt)}</TableCell>
                              <TableCell className="hidden md:table-cell">{formatDate(donation.expiryDate)}</TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[donation.status]} flex items-center gap-1 w-fit`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {donation.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Donations Tab */}
          <TabsContent value="active-donations" className="space-y-6">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>All Active Donations</CardTitle>
                <CardDescription>Currently available medicines on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {data.activeDonations.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No active donations on the platform yet. Be the first to donate!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.activeDonations.map((donation, idx) => {
                      const StatusIcon = statusIcons[donation.status]
                      return (
                        <Card
                          key={donation._id}
                          className="dark:border-slate-700 transition-smooth hover-lift animate-fade-in-up"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{donation.medicineName}</CardTitle>
                              <Badge className={`${statusColors[donation.status]} flex items-center gap-1`}>
                                <StatusIcon className="h-3 w-3" />
                                {donation.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Quantity:</span>
                                <p className="font-medium">{donation.quantity} units</p>
                              </div>
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Expires:</span>
                                <p className="font-medium">{formatDate(donation.expiryDate)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{session.user?.email}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Name</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{session.user?.name}</p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent transition-smooth"
                >
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
