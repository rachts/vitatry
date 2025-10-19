import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !["admin", "ngo_partner"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter: any = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

    const [totalDonations, verifiedDonations, distributedDonations, donations] = await Promise.all([
      Donation.countDocuments(query),
      Donation.countDocuments({ ...query, status: "verified" }),
      Donation.countDocuments({ ...query, status: "distributed" }),
      Donation.find(query).select("medicineName quantity status category createdAt distributedAt").lean(),
    ])

    const totalMedicinesQuantity = donations.reduce((sum, d) => sum + d.quantity, 0)

    const impactByCategory = await Donation.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ])

    const report = {
      title: "CSR Report",
      period: {
        startDate: startDate || "All time",
        endDate: endDate || "Present",
      },
      totals: {
        donations: totalDonations,
        impactScore: totalMedicinesQuantity,
      },
      summary: {
        totalDonations,
        verifiedDonations,
        distributedDonations,
        totalMedicinesQuantity,
        verificationRate: totalDonations > 0 ? ((verifiedDonations / totalDonations) * 100).toFixed(2) + "%" : "0%",
        distributionRate:
          verifiedDonations > 0 ? ((distributedDonations / verifiedDonations) * 100).toFixed(2) + "%" : "0%",
      },
      impactByCategory,
      environmentalImpact: {
        wasteReduced: `${(totalMedicinesQuantity * 0.05).toFixed(2)} kg`,
        co2Saved: `${(totalMedicinesQuantity * 0.02).toFixed(2)} kg`,
      },
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    console.error("Error generating CSR report:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to generate report" }, { status: 500 })
  }
}
