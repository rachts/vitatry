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

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const userEmail = session.user.email

    const donations = await Donation.find({ donorEmail: userEmail }).sort({ createdAt: -1 }).lean()

    const totalDonations = donations.length
    const verifiedDonations = donations.filter((d) => d.status === "verified").length
    const distributedDonations = donations.filter((d) => d.status === "distributed").length
    const totalMedicinesQuantity = donations.reduce((sum, d) => sum + d.quantity, 0)

    const donationsByCategory = donations.reduce(
      (acc, d) => {
        acc[d.category] = (acc[d.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const donationsByStatus = donations.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const report = {
      summary: {
        totalDonations,
        verifiedDonations,
        distributedDonations,
        totalMedicinesQuantity,
        impactScore: distributedDonations * 10,
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
    return NextResponse.json({ success: false, error: error.message || "Failed to generate report" }, { status: 500 })
  }
}
