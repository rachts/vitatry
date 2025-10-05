import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, email, phone, role, availability, experience, motivation } = body

    if (!name || !email || !phone || !role || !availability) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const existingApplication = await VolunteerApplication.findOne({ email })
    if (existingApplication) {
      return NextResponse.json({ success: false, error: "Application already exists for this email" }, { status: 400 })
    }

    const application = await VolunteerApplication.create({
      name,
      email,
      phone,
      role,
      availability,
      experience: experience || undefined,
      motivation: motivation || undefined,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      application: {
        ...application.toObject(),
        _id: application._id.toString(),
      },
      message: "Volunteer application submitted successfully",
    })
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

    const query = status ? { status } : {}

    const applications = await VolunteerApplication.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      applications: applications.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching volunteer applications:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applications" },
      { status: 500 },
    )
  }
}
