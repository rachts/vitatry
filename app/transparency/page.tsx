import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Eye, FileText, Users } from "lucide-react"

export default function TransparencyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">Transparency Report</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe in complete transparency. Track how donations are processed, verified, and distributed to ensure
            maximum impact and accountability.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Medicines</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11,203</div>
              <p className="text-xs text-muted-foreground">87.2% approval rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distributed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10,891</div>
              <p className="text-xs text-muted-foreground">97.2% distribution rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active NGOs</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Partner organizations</p>
            </CardContent>
          </Card>
        </div>

        {/* Process Transparency */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Verification Process</CardTitle>
              <CardDescription>How we ensure medicine safety and quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>AI Initial Screening</span>
                <Badge variant="secondary">Automated</Badge>
              </div>
              <Progress value={100} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Pharmacist Review</span>
                <Badge variant="secondary">Manual</Badge>
              </div>
              <Progress value={87} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Quality Assurance</span>
                <Badge variant="secondary">Final Check</Badge>
              </div>
              <Progress value={97} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribution Timeline</CardTitle>
              <CardDescription>Average time from donation to distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Collection</span>
                <span className="text-sm text-muted-foreground">1-2 days</span>
              </div>
              <Progress value={100} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Verification</span>
                <span className="text-sm text-muted-foreground">2-3 days</span>
              </div>
              <Progress value={75} className="h-2" />

              <div className="flex justify-between items-center">
                <span>Distribution</span>
                <span className="text-sm text-muted-foreground">1-2 days</span>
              </div>
              <Progress value={90} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest donations and distributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Medicine Verified", item: "Paracetamol 500mg x50", time: "2 hours ago", status: "approved" },
                {
                  action: "Distribution Complete",
                  item: "Antibiotics to City Hospital NGO",
                  time: "4 hours ago",
                  status: "completed",
                },
                { action: "New Donation", item: "Diabetes medications", time: "6 hours ago", status: "pending" },
                {
                  action: "Quality Check",
                  item: "Blood pressure medications",
                  time: "8 hours ago",
                  status: "in-progress",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.item}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        activity.status === "approved" || activity.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
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
