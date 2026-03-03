"use client"

import { useAuth } from "@/context/AuthContext"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Award, Heart } from "lucide-react"
import { useEffect, useState } from "react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [donationCount, setDonationCount] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      redirect("/auth/signin")
    }
    if (user) {
      fetchUserDonations()
    }
  }, [user, loading])

  const fetchUserDonations = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/donations?email=${encodeURIComponent(user.email || "")}`)
      const data = await res.json()
      setDonationCount((data.donations || []).length)
    } catch (error) {
      console.error("Error fetching donations:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600">Manage your account and view your impact</p>
          </div>
          <Button>Edit Profile</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle>{user.displayName || "User"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge className="mt-2">Donor</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined{" "}
                    {user.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Verified Donor</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>See how your contributions are making a difference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{donationCount}</div>
                    <div className="text-sm text-muted-foreground">Medicines Donated</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{donationCount * 3}</div>
                    <div className="text-sm text-muted-foreground">People Helped</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Badges and milestones you have earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {donationCount > 0 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="font-medium">First Donation</p>
                        <p className="text-sm text-muted-foreground">Made your first medicine donation</p>
                      </div>
                    </div>
                  )}
                  {donationCount >= 10 && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Heart className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium">Helping Hand</p>
                        <p className="text-sm text-muted-foreground">Helped 10+ people</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
