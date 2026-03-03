import { NextResponse } from "next/server"
import { submitVolunteerApplication, getVolunteers } from "@/lib/db/volunteers"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      address,
      city,
      availability,
      skills,
      experience,
      motivation,
    } = body

    if (!name || !email || !phone || !city || !availability) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const volunteer = await submitVolunteerApplication({
      name,
      email,
      phone,
      address: address || "",
      city,
      availability,
      skills: skills || [],
      experience: experience || "",
      motivation: motivation || "",
    })

    return NextResponse.json({ success: true, volunteer }, { status: 201 })
  } catch (error: unknown) {
    console.error("Error submitting volunteer application:", error)

    const mongoError = error as { code?: number }
    if (mongoError.code === 11000) {
      return NextResponse.json(
        { error: "A volunteer application with this email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit volunteer application" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const volunteers = await getVolunteers()
    return NextResponse.json({ volunteers })
  } catch (error) {
    console.error("Error fetching volunteers:", error)
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    )
  }
}
