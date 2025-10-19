import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

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
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const query = status ? { status } : {}
    const skip = (page - 1) * limit

    const [volunteers, total] = await Promise.all([
      VolunteerApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      VolunteerApplication.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      volunteers: volunteers.map((v) => ({
        ...v,
        _id: v._id?.toString(),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error("Admin volunteers GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch volunteers" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { volunteerId, status } = await req.json()

    if (!volunteerId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const volunteer = await VolunteerApplication.findByIdAndUpdate(volunteerId, { status }, { new: true })

    if (!volunteer) {
      return NextResponse.json({ success: false, error: "Volunteer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      volunteer: {
        ...volunteer.toObject(),
        _id: volunteer._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error("Admin volunteers PATCH error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update volunteer" }, { status: 500 })
  }
}
