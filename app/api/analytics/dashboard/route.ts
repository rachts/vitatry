export const dynamic = "force-dynamic"
export const revalidate = 0

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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const timeframe = searchParams.get("timeframe") || "30d"

    await dbConnect()

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

    const [totalDonations, totalUsers, totalVolunteers, recentDonations] = await Promise.all([
      Donation.countDocuments(),
      User.countDocuments(),
      VolunteerApplication.countDocuments(),
      Donation.countDocuments({ createdAt: { $gte: startDate } }),
    ])

    const donationsByStatus = await Donation.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])

    const monthlyTrends = await Donation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          donations: { $sum: 1 },
          medicines: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    const topMedicines = await Donation.aggregate([
      { $group: { _id: "$medicineName", count: { $sum: "$quantity" }, donations: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    const totalMedicines = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$quantity" },
          uniqueMedicines: { $addToSet: "$medicineName" },
        },
      },
    ])

    const impactMetrics = {
      livesHelped: Math.floor((totalMedicines[0]?.totalQuantity || 0) * 0.3),
      co2Saved: Math.floor((totalMedicines[0]?.totalQuantity || 0) * 0.05),
      wasteReduced: Math.floor((totalMedicines[0]?.totalQuantity || 0) * 0.1),
      uniqueMedicines: totalMedicines[0]?.uniqueMedicines?.length || 0,
    }

    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const previousPeriodDonations = await Donation.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    })

    const growthRate =
      previousPeriodDonations > 0 ? ((recentDonations - previousPeriodDonations) / previousPeriodDonations) * 100 : 0

    return NextResponse.json({
      success: true,
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
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
