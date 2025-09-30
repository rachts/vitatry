import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await dbConnect()

  try {
    // Get user data
    const user = await User.findById(session.user.id)

    // Get user's donations
    const donations = await Donation.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10)

    // Calculate volunteer stats (mock data for now)
    const volunteerStats = {
      hoursContributed: 25,
      activitiesCompleted: 8,
      impactScore: 150,
    }

    // Get recent activity (mock data for now)
    const recentActivity = [
      { type: "donation", description: "Medicine donation verified", date: new Date() },
      { type: "volunteer", description: "Completed collection drive", date: new Date() },
    ]

    return NextResponse.json({
      donations,
      volunteerStats,
      credits: user?.credits || 0,
      recentActivity,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
