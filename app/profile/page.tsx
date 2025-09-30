import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Award, Heart } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

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
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle>{session.user.name}</CardTitle>
                <CardDescription>{session.user.email}</CardDescription>
                <Badge className="mt-2">{session.user.role || "donor"}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined December 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Verified Donor</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity & Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Impact Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>See how your contributions are making a difference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-muted-foreground">Medicines Donated</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-muted-foreground">People Helped</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest donations and contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Medicine Donated",
                      item: "Paracetamol 500mg x50",
                      status: "verified",
                      time: "2 days ago",
                    },
                    { action: "Medicine Donated", item: "Antibiotics x30", status: "distributed", time: "1 week ago" },
                    { action: "Profile Updated", item: "Added phone number", status: "completed", time: "2 weeks ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.item}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === "distributed" ? "default" : "secondary"}>
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Badges and milestones you've earned</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">First Donation</p>
                      <p className="text-sm text-muted-foreground">Made your first medicine donation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Heart className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium">Helping Hand</p>
                      <p className="text-sm text-muted-foreground">Helped 10+ people</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
