import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // ✅ Use Promise.all for better performance
    const [totalDonations, distributedDonations, distributedList] = await Promise.all([
      Donation.countDocuments({}),
      Donation.countDocuments({ status: "distributed" }),
      Donation.find({ status: "distributed" }).select("quantity").lean(),
    ])

    // ✅ Handle potential missing or invalid quantities safely
    const totalMedicinesQuantity = distributedList.reduce((sum, d) => sum + (d.quantity || 0), 0)

    // ✅ Derived sustainability metrics
    const wasteReduced = totalMedicinesQuantity * 0.05 // kg
    const co2Saved = totalMedicinesQuantity * 0.02 // kg
    const waterSaved = totalMedicinesQuantity * 0.5 // liters
    const livesImpacted = distributedDonations * 2 // estimated impact factor

    // ✅ Clean, descriptive response
    const metrics = {
      wasteReduced: {
        value: wasteReduced.toFixed(2),
        unit: "kg",
        description: "Medical waste prevented from reaching landfills",
      },
      co2Saved: {
        value: co2Saved.toFixed(2),
        unit: "kg",
        description: "CO₂ emissions prevented through redistribution",
      },
      waterSaved: {
        value: waterSaved.toFixed(2),
        unit: "liters",
        description: "Water saved from reduced pharmaceutical production",
      },
      medicinesDistributed: {
        value: totalMedicinesQuantity,
        unit: "units",
        description: "Medicines successfully redistributed to beneficiaries",
      },
      livesImpacted: {
        value: livesImpacted,
        unit: "people",
        description: "Estimated number of lives positively impacted",
      },
      totalDonations: {
        value: totalDonations,
        unit: "donations",
        description: "Total donations received since inception",
      },
    }

    return NextResponse.json({ success: true, metrics })
  } catch (error: any) {
    console.error("Error fetching sustainability metrics:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sustainability metrics" },
      { status: 500 }
    )
  }
}
