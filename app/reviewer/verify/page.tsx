import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react"

export default async function ReviewerVerifyPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "reviewer") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Medicine Verification</h1>
            <p className="text-gray-600">Review and verify donated medicines for quality and safety</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              23 Pending
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">14.5% rejection rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Medicines awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  medicine: "Paracetamol 500mg",
                  quantity: "50 tablets",
                  expiry: "Dec 2025",
                  donor: "John Doe",
                  submitted: "2 hours ago",
                  priority: "high",
                },
                {
                  medicine: "Amoxicillin 250mg",
                  quantity: "30 capsules",
                  expiry: "Mar 2025",
                  donor: "Jane Smith",
                  submitted: "4 hours ago",
                  priority: "medium",
                },
                {
                  medicine: "Insulin Glargine",
                  quantity: "5 pens",
                  expiry: "Jan 2025",
                  donor: "Medical Center",
                  submitted: "6 hours ago",
                  priority: "high",
                },
                {
                  medicine: "Metformin 500mg",
                  quantity: "100 tablets",
                  expiry: "Aug 2025",
                  donor: "Pharmacy Plus",
                  submitted: "8 hours ago",
                  priority: "low",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.medicine}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} • Expires {item.expiry} • From {item.donor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={
                        item.priority === "high" ? "destructive" : item.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {item.priority} priority
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.submitted}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
