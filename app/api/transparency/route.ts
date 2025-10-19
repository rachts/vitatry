import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const donations = await Donation.find({ status: "distributed" })
      .select("medicineName quantity category distributedAt donorName")
      .sort({ distributedAt: -1 })
      .limit(100)
      .lean()

    const stats = {
      totalDonations: await Donation.countDocuments({}),
      verifiedDonations: await Donation.countDocuments({ status: "verified" }),
      distributedDonations: await Donation.countDocuments({ status: "distributed" }),
      rejectedDonations: await Donation.countDocuments({ status: "rejected" }),
    }

    return NextResponse.json({
      success: true,
      stats,
      recentDistributions: donations.map((d) => ({
        ...d,
        _id: d._id?.toString(),
      })),
    })
  } catch (error: any) {
    console.error("Transparency error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch transparency data" },
      { status: 500 },
    )
  }
}
