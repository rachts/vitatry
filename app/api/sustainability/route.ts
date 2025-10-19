import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const [totalDonations, distributedDonations] = await Promise.all([
      Donation.countDocuments({}),
      Donation.countDocuments({ status: "distributed" }),
    ])

    const donations = await Donation.find({ status: "distributed" }).select("quantity").lean()

    const totalMedicinesQuantity = donations.reduce((sum, d) => sum + d.quantity, 0)

    const wasteReduced = totalMedicinesQuantity * 0.05
    const co2Saved = totalMedicinesQuantity * 0.02
    const waterSaved = totalMedicinesQuantity * 0.5
    const livesImpacted = distributedDonations * 2

    const sustainability = {
      wasteReducedKg: Number.parseFloat(wasteReduced.toFixed(2)),
      co2SavedKg: Number.parseFloat(co2Saved.toFixed(2)),
      communitiesServed: distributedDonations,
    }

    return NextResponse.json({
      success: true,
      sustainability,
      updatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error fetching sustainability metrics:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch metrics" }, { status: 500 })
  }
}
