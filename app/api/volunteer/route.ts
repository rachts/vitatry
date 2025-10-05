export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const query: any = {}
    if (status) query.status = status

    const applications = await VolunteerApplication.find(query).sort({ createdAt: -1 }).limit(50)

    return NextResponse.json({
      success: true,
      applications,
      total: applications.length,
    })
  } catch (error) {
    console.error("Error fetching volunteer applications:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    const application = await VolunteerApplication.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      availability: body.availability,
      experience: body.experience || undefined,
      motivation: body.motivation || undefined,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      message: "Volunteer application submitted successfully",
      application: {
        _id: application._id,
        status: application.status,
      },
    })
  } catch (error) {
    console.error("Error creating volunteer application:", error)
    return NextResponse.json({ success: false, error: "Failed to submit application" }, { status: 500 })
  }
}
