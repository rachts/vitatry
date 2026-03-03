"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Eye, FileText, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
export default function TransparencyPage() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    medicinesVerified: 0,
    livesHelped: 0,
    activeVolunteers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        setStats({
          totalDonations: data.totalDonations || 0,
          medicinesVerified: data.approvedDonations || 0,
          livesHelped: data.distributedDonations || 0,
          activeVolunteers: data.activeVolunteers || 0,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statsConfig = [
    {
      title: "Total Donations",
      value: stats.totalDonations,
      subtitle: stats.totalDonations === 0 ? "Be the first to donate" : "Medicines donated",
      icon: FileText,
    },
    {
      title: "Verified Medicines",
      value: stats.medicinesVerified,
      subtitle: stats.medicinesVerified === 0 ? "Pending verifications" : "Quality checked",
      icon: Shield,
    },
    {
      title: "Lives Helped",
      value: stats.livesHelped,
      subtitle: stats.livesHelped === 0 ? "Ready to help" : "People benefited",
      icon: Users,
    },
    {
      title: "Active Volunteers",
      value: stats.activeVolunteers,
      subtitle: stats.activeVolunteers === 0 ? "Onboarding volunteers" : "Active helpers",
      icon: Eye,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Transparency Report</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            We believe in complete transparency. Track how donations are processed, verified, and distributed.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {statsConfig.map((stat, idx) => (
            <Card
              key={stat.title}
              className="transition-smooth hover-lift animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <span className="animate-pulse">...</span> : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Process Transparency */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
          <Card className="transition-smooth hover-lift animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <CardHeader>
              <CardTitle>Verification Process</CardTitle>
              <CardDescription>How we ensure medicine safety and quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "AI Initial Screening", badge: "Automated" },
                { label: "Pharmacist Review", badge: "Manual" },
                { label: "Quality Assurance", badge: "Final Check" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    <Badge variant="secondary">{item.badge}</Badge>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="transition-smooth hover-lift animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <CardHeader>
              <CardTitle>Distribution Timeline</CardTitle>
              <CardDescription>Average time from donation to distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Collection", time: "1-2 days" },
                { label: "Verification", time: "2-3 days" },
                { label: "Distribution", time: "1-2 days" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="transition-smooth hover-lift animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest donations and distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-300">No Activity Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Activity will appear here once donations start flowing through the platform.
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 transition-smooth hover-lift">
                <Link href="/donate">Make First Donation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
