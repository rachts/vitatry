import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const available = searchParams.get("available")

    const query: any = { status: "verified" }
    if (category) query.category = category
    if (available === "true") query.isReserved = false

    const medicines = await Donation.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      medicines: medicines.map((m) => ({
        ...m,
        _id: m._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch medicines" }, { status: 500 })
  }
}
