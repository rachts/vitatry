export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const query: any = { status: "verified", isReserved: false }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { medicineName: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { genericName: { $regex: search, $options: "i" } },
      ]
    }

    const medicines = await Donation.find(query).sort({ createdAt: -1 }).limit(50)

    return NextResponse.json({
      success: true,
      medicines,
      total: medicines.length,
    })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
