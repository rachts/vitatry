import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"
import VolunteerApplication from "@/models/VolunteerApplication"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "30d"

    await dbConnect()

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (timeframe) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get basic stats
    const [totalDonations, totalUsers, totalVolunteers, recentDonations] = await Promise.all([
      Donation.countDocuments(),
      User.countDocuments(),
      VolunteerApplication.countDocuments(),
      Donation.countDocuments({ createdAt: { $gte: startDate } }),
    ])

    // Get donation status breakdown
    const donationsByStatus = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    // Get monthly trends
    const monthlyTrends = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          donations: { $sum: 1 },
          medicines: { $sum: { $size: "$medicines" } },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Get top medicines
    const topMedicines = await Donation.aggregate([
      { $unwind: "$medicines" },
      {
        $group: {
          _id: "$medicines.name",
          count: { $sum: "$medicines.quantity" },
          donations: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    // Calculate impact metrics
    const totalMedicines = await Donation.aggregate([
      { $unwind: "$medicines" },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$medicines.quantity" },
          uniqueMedicines: { $addToSet: "$medicines.name" },
        },
      },
    ])

    const impactMetrics = {
      livesHelped: Math.floor(totalMedicines[0]?.totalQuantity * 0.3) || 0, // Estimate
      co2Saved: Math.floor(totalMedicines[0]?.totalQuantity * 0.05) || 0, // kg CO2
      wasteReduced: Math.floor(totalMedicines[0]?.totalQuantity * 0.1) || 0, // kg waste
      uniqueMedicines: totalMedicines[0]?.uniqueMedicines?.length || 0,
    }

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousPeriodDonations = await Donation.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    })

    const growthRate =
      previousPeriodDonations > 0 ? ((recentDonations - previousPeriodDonations) / previousPeriodDonations) * 100 : 0

    return NextResponse.json({
      overview: {
        totalDonations,
        totalUsers,
        totalVolunteers,
        recentDonations,
        growthRate: Math.round(growthRate * 100) / 100,
      },
      donationsByStatus: donationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      monthlyTrends,
      topMedicines,
      impactMetrics,
      timeframe,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
