import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, phone, city, address, experience, roles, availability, motivation } = body

    if (!name || !email || !phone || !city || !address) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    const volunteer = await VolunteerApplication.create({
      name,
      email,
      phone,
      city,
      address,
      experience: experience || "beginner",
      roles: roles || [],
      availability: availability || [],
      motivation: motivation || "",
      status: "pending",
    })

    return NextResponse.json(
      {
        success: true,
        volunteer: {
          ...volunteer.toObject(),
          _id: volunteer._id?.toString(),
        },
        message: "Volunteer application submitted successfully!",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating volunteer application:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit application" },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: Record<string, any> = {}
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status
    }

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
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching volunteers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch volunteers" }, { status: 500 })
  }
}
