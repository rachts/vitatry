import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, email, phone, role, availability, experience, motivation } = body

    // Validate required fields
    if (!name || !email || !phone || !role || !availability) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Validate role
    const validRoles = ["verifier", "collector", "distributor", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate availability
    const validAvailability = ["fulltime", "parttime", "weekends"]
    if (!validAvailability.includes(availability)) {
      return NextResponse.json(
        { success: false, error: `Invalid availability. Must be one of: ${validAvailability.join(", ")}` },
        { status: 400 },
      )
    }

    // Check for existing application
    const normalizedEmail = email.trim().toLowerCase()
    const existingApplication = await VolunteerApplication.findOne({ email: normalizedEmail })
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "Application already exists for this email address" },
        { status: 409 },
      )
    }

    const application = await VolunteerApplication.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role,
      availability,
      experience: experience?.trim() || undefined,
      motivation: motivation?.trim() || undefined,
      status: "pending",
    })

    return NextResponse.json(
      {
        success: true,
        application: {
          ...application.toObject(),
          _id: application._id?.toString(),
        },
        message: "Volunteer application submitted successfully",
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

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: Record<string, any> = {}
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status
    }

    const skip = (page - 1) * limit
    const [applications, total] = await Promise.all([
      VolunteerApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      VolunteerApplication.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      applications: applications.map((a) => ({
        ...a,
        _id: a._id?.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching volunteer applications:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch applications" }, { status: 500 })
  }
}
