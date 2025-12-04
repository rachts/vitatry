import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await req.json()

    if (!data.medicineName || !data.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const donation = await Donation.create({
      ...data,
      donationId,
      donorEmail: data.email,
      donorName: data.firstName ? `${data.firstName} ${data.lastName || ""}`.trim() : session.user.name,
      status: "pending",
    })

    return NextResponse.json(
      {
        success: true,
        message: "Donation submitted successfully",
        id: donation._id?.toString(),
        donationId: donation.donationId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("V1 Donation POST error:", error)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)
    const status = searchParams.get("status")

    const query: Record<string, unknown> = {}

    // Non-admin users can only see their own donations
    if (session.user.role !== "admin") {
      query.donorEmail = session.user.email
    }

    if (status && ["pending", "verified", "rejected", "distributed"].includes(status)) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [donations, total] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Donation.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      donations: donations.map((d) => ({
        ...d,
        _id: d._id?.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("V1 Donation GET error:", error)
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
  }
}
