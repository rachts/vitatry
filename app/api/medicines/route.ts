import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const available = searchParams.get("available")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: any = { status: "verified" }
    if (category) {
      query.category = category
    }
    if (available === "true") {
      query.isReserved = false
    }

    const skip = (page - 1) * limit

    const [medicines, total] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Donation.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      medicines: medicines.map((m) => ({
        ...m,
        _id: m._id?.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch medicines" }, { status: 500 })
  }
}
