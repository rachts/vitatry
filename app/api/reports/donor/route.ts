import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // ✅ Authorization check
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userEmail = session.user.email

    // ✅ Fetch all donations by the logged-in donor
    const donations = await Donation.find({ donorEmail: userEmail })
      .sort({ createdAt: -1 })
      .select("medicineName quantity status category createdAt distributedAt")
      .lean()

    // ✅ Safe aggregation calculations
    const totalDonations = donations.length
    const verifiedDonations = donations.filter((d) => d.status === "verified").length
    const distributedDonations = donations.filter((d) => d.status === "distributed").length
    const totalMedicinesQuantity = donations.reduce((sum, d) => sum + (d.quantity || 0), 0)

    // ✅ Category and status breakdowns
    const donationsByCategory = donations.reduce((acc, d) => {
      if (d.category) acc[d.category] = (acc[d.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const donationsByStatus = donations.reduce((acc, d) => {
      if (d.status) acc[d.status] = (acc[d.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // ✅ Structured donor report
    const report = {
      donor: {
        name: session.user.name || "Anonymous Donor",
        email: userEmail,
      },
      summary: {
        totalDonations,
        verifiedDonations,
        distributedDonations,
        totalMedicinesQuantity,
        impactScore: distributedDonations * 10, // Arbitrary engagement metric
      },
      donations: donations.map((d) => ({
        ...d,
        _id: d._id.toString(),
      })),
      donationsByCategory,
      donationsByStatus,
      environmentalImpact: {
        wasteReduced: `${(totalMedicinesQuantity * 0.05).toFixed(2)} kg`,
        co2Saved: `${(totalMedicinesQuantity * 0.02).toFixed(2)} kg`,
        livesImpacted: distributedDonations * 2,
      },
    }

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    console.error("Error generating donor report:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report" },
      { status: 500 }
    )
  }
}
