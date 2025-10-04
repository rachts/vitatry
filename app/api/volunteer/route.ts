export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, email, phone, role, availability, experience, motivation } = body

    if (!name || !email || !phone || !role || !availability) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const application = await VolunteerApplication.create({
      name,
      email,
      phone,
      role,
      availability,
      experience,
      motivation,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      message: "Volunteer application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Error creating volunteer application:", error)
    return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    await dbConnect()

    const query: any = {}
    if (status) {
      query.status = status
    }

    const applications = await VolunteerApplication.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Error fetching volunteer applications:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
