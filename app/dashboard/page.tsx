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
import { ArrowRight, Heart, Pill, Users, Award } from "lucide-react"

interface DashboardStats {
  donations: number
  medicinesVerified: number
  livesHelped: number
  impactScore: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    donations: 0,
    medicinesVerified: 0,
    livesHelped: 0,
    impactScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/dashboard")
    }
  }, [status])

  useEffect(() => {
    if (session?.user) {
      const fetchStats = async () => {
        try {
          const res = await fetch("/api/dashboard")
          if (res.ok) {
            const data = await res.json()
            setStats(data)
          }
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchStats()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </Shell>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Welcome back, {session.user?.name || "User"}! 👋</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/donate">
                <Icons.plus className="h-4 w-4 mr-2" />
                New Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-auto p-6 flex flex-col items-start justify-start dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
          >
            <Link href="/donate">
              <Heart className="h-6 w-6 text-emerald-600 mb-2" />
              <span className="font-semibold text-left">Donate Medicines</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Help someone in need</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto p-6 flex flex-col items-start justify-start dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
          >
            <Link href="/volunteer">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <span className="font-semibold text-left">Become Volunteer</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Join our team</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto p-6 flex flex-col items-start justify-start dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
          >
            <Link href="/shop">
              <Pill className="h-6 w-6 text-purple-600 mb-2" />
              <span className="font-semibold text-left">Browse Shop</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Support our mission</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.donations}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">donations made</p>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicines Verified</CardTitle>
              <Pill className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.medicinesVerified}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">verified items</p>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lives Helped</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.livesHelped}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">people impacted</p>
            </CardContent>
          </Card>

          <Card className="dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.impactScore}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">total impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="dark:bg-slate-900 dark:border-slate-800">
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-6">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Your latest medicine donations and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No donations yet. Start by donating medicines to make a difference!
                  </p>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/donate">
                      Make Your First Donation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Your purchases and shop orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No orders yet. Browse our shop to support our mission!
                  </p>
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link href="/shop">
                      Browse Shop
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                  className="dark:border-slate-700 dark:hover:bg-slate-800 bg-transparent"
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
