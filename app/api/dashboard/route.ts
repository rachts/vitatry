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

    const userEmail = session.user.email

    const myDonations = await Donation.find({ donorEmail: userEmail })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("donationId medicineName quantity status createdAt expiryDate")
      .lean()

    const activeDonations = await Donation.find({
      status: { $in: ["pending", "verified"] },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("donationId medicineName quantity status createdAt expiryDate")
      .lean()

    // Fetch donation stats for the user
    const donations = await Donation.countDocuments({ donorEmail: userEmail })
    const medicinesVerified = await Donation.countDocuments({
      donorEmail: userEmail,
      status: "verified",
    })
    const livesHelpedData = await Donation.aggregate([
      { $match: { donorEmail: userEmail, status: "distributed" } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ])
    const livesHelped = livesHelpedData[0]?.total || 0

    // Simple impact score calculation
    const impactScore = donations * 10 + medicinesVerified * 5 + livesHelped

    return NextResponse.json({
      stats: {
        donations,
        medicinesVerified,
        livesHelped,
        impactScore,
      },
      myDonations: myDonations || [],
      activeDonations: activeDonations || [],
    })
  } catch (error) {
    console.error("Dashboard API error:", error)
    return NextResponse.json({
      stats: { donations: 0, medicinesVerified: 0, livesHelped: 0, impactScore: 0 },
      myDonations: [],
      activeDonations: [],
    })
  }
}
