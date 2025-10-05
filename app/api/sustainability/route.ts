import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

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

    const metrics = {
      wasteReduced: {
        value: wasteReduced.toFixed(2),
        unit: "kg",
        description: "Medical waste prevented from landfills",
      },
      co2Saved: {
        value: co2Saved.toFixed(2),
        unit: "kg",
        description: "CO2 emissions reduced",
      },
      waterSaved: {
        value: waterSaved.toFixed(2),
        unit: "liters",
        description: "Water saved from manufacturing",
      },
      medicinesDistributed: {
        value: totalMedicinesQuantity,
        unit: "units",
        description: "Medicines redistributed to those in need",
      },
      livesImpacted: {
        value: livesImpacted,
        unit: "people",
        description: "Lives positively impacted",
      },
      totalDonations: {
        value: totalDonations,
        unit: "donations",
        description: "Total donations received",
      },
    }

    return NextResponse.json({ success: true, metrics })
  } catch (error: any) {
    console.error("Error fetching sustainability metrics:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch metrics" }, { status: 500 })
  }
}
