import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const verified = searchParams.get("verified")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const query = verified !== null ? { verified: verified === "true" } : {}
    const skip = (page - 1) * limit

    const [medicines, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      medicines: medicines.map((m) => ({
        ...m,
        _id: m._id?.toString(),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error("Admin medicines GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch medicines" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { medicineId, updates } = await req.json()

    if (!medicineId) {
      return NextResponse.json({ success: false, error: "Medicine ID is required" }, { status: 400 })
    }

    await dbConnect()

    const medicine = await Product.findByIdAndUpdate(medicineId, updates, { new: true })

    if (!medicine) {
      return NextResponse.json({ success: false, error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      medicine: {
        ...medicine.toObject(),
        _id: medicine._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error("Admin medicines PATCH error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update medicine" }, { status: 500 })
  }
}
