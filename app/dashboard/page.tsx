"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shell } from "@/components/shell"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </Shell>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session.user?.name || "User"}!</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/donate">
                <Icons.plus className="h-4 w-4 mr-2" />
                New Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Icons.heart className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medicines Donated</CardTitle>
              <Icons.pill className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+8 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lives Helped</CardTitle>
              <Icons.users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+24 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <Icons.award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">+67 from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="donations">My Donations</TabsTrigger>
            <TabsTrigger value="impact">Impact Report</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Your latest medicine donations and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, medicine: "Paracetamol 500mg", quantity: 20, status: "verified", date: "2024-01-15" },
                    { id: 2, medicine: "Ibuprofen 400mg", quantity: 15, status: "pending", date: "2024-01-12" },
                    { id: 3, medicine: "Amoxicillin 250mg", quantity: 10, status: "distributed", date: "2024-01-08" },
                  ].map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Icons.pill className="h-8 w-8 text-emerald-600" />
                        <div>
                          <p className="font-medium">{donation.medicine}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {donation.quantity} • {donation.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          donation.status === "verified"
                            ? "default"
                            : donation.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {donation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                  <CardDescription>Your contribution to reducing medical waste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CO₂ Saved</span>
                      <span>2.4 kg</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Waste Reduced</span>
                      <span>1.6 kg</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Impact</CardTitle>
                  <CardDescription>Lives touched through your donations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600">156</div>
                    <p className="text-sm text-gray-600">People helped</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">8</div>
                    <p className="text-sm text-gray-600">Communities reached</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "First Donation",
                  description: "Made your first medicine donation",
                  earned: true,
                  icon: Icons.heart,
                },
                {
                  title: "Life Saver",
                  description: "Helped 100+ people with your donations",
                  earned: true,
                  icon: Icons.users,
                },
                {
                  title: "Eco Warrior",
                  description: "Saved 5kg of CO₂ through donations",
                  earned: false,
                  icon: Icons.shield,
                },
                { title: "Community Hero", description: "Reached 10+ communities", earned: false, icon: Icons.award },
              ].map((achievement, index) => (
                <Card
                  key={index}
                  className={achievement.earned ? "border-emerald-200 bg-emerald-50" : "border-gray-200"}
                >
                  <CardContent className="p-6 text-center">
                    <achievement.icon
                      className={`h-12 w-12 mx-auto mb-4 ${achievement.earned ? "text-emerald-600" : "text-gray-400"}`}
                    />
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                    <Badge variant={achievement.earned ? "default" : "secondary"}>
                      {achievement.earned ? "Earned" : "Locked"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
