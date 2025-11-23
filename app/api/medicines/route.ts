import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "verified"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: Record<string, any> = {
      status: status,
      isReserved: false,
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
    return NextResponse.json({ success: false, error: "Failed to fetch medicines" }, { status: 500 })
  }
}
