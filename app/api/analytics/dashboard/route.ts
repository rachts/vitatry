import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"
import VolunteerApplication from "@/models/VolunteerApplication"
import Product from "@/models/Product"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const [totalDonations, verifiedDonations, totalUsers, totalVolunteers, totalProducts] = await Promise.all([
      Donation.countDocuments({}),
      Donation.countDocuments({ status: "verified" }),
      User.countDocuments({}),
      VolunteerApplication.countDocuments({ status: "approved" }),
      Product.countDocuments({}),
    ])

    const recentDonations = await Donation.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("medicineName brand quantity status createdAt donorName")
      .lean()

    const donationsByCategory = await Donation.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ])

    const donationsByStatus = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const monthlyDonations = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalDonations,
          verifiedDonations,
          totalUsers,
          totalVolunteers,
          totalProducts,
        },
        recentDonations: recentDonations.map((d) => ({
          ...d,
          _id: d._id.toString(),
        })),
        donationsByCategory,
        donationsByStatus,
        monthlyDonations,
      },
    })
  } catch (error: any) {
    console.error("Error fetching dashboard analytics:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch analytics" }, { status: 500 })
  }
}
