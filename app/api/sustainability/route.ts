export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SustainabilityTracker } from "@/lib/sustainability-metrics"
import User from "@/models/User"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [userImpact, globalImpact, leaderboard] = await Promise.all([
      SustainabilityTracker.calculateUserImpact(session.user.id),
      SustainabilityTracker.calculateGlobalImpact(),
      SustainabilityTracker.getLeaderboard(10),
    ])

    const newAchievements = await SustainabilityTracker.checkAndAwardAchievements(session.user.id)
    const user = await User.findById(session.user.id)
    const achievements = user?.achievements || []

    return NextResponse.json({
      success: true,
      userImpact,
      globalImpact,
      achievements,
      leaderboard,
      newAchievements,
    })
  } catch (error) {
    console.error("Error fetching sustainability:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
