import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.email

    // Fetch donation stats
    const donations = await Donation.countDocuments({ donorEmail: userId })
    const medicinesVerified = await Donation.countDocuments({
      donorEmail: userId,
      status: "verified",
    })
    const livesHelpedData = await Donation.aggregate([
      { $match: { donorEmail: userId, status: "distributed" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ])
    const livesHelped = livesHelpedData[0]?.total || 0

    // Simple impact score calculation
    const impactScore = donations * 10 + medicinesVerified * 5 + livesHelped

    return NextResponse.json({
      donations,
      medicinesVerified,
      livesHelped,
      impactScore,
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
