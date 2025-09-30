import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import { SustainabilityTracker } from "@/lib/sustainability-metrics"
import User from "@/models/User"
import dbConnect from "@/lib/dbConnect"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [userImpact, globalImpact, leaderboard] = await Promise.all([
      SustainabilityTracker.calculateUserImpact(session.user.id),
      SustainabilityTracker.calculateGlobalImpact(),
      SustainabilityTracker.getLeaderboard(10),
    ])

    // Check for new achievements
    const newAchievements = await SustainabilityTracker.checkAndAwardAchievements(session.user.id)

    // Get user's existing achievements
    const user = await User.findById(session.user.id)
    const achievements = user?.achievements || []

    return NextResponse.json({
      userImpact,
      globalImpact,
      achievements,
      leaderboard,
      newAchievements,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
