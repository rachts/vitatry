import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error("Admin donations GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch donations" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { donationId, status, verificationNotes } = await req.json()

    if (!donationId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        status,
        verificationNotes,
        reviewedBy: session.user.id,
      },
      { new: true },
    )

    if (!donation) {
      return NextResponse.json({ success: false, error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      donation: {
        ...donation.toObject(),
        _id: donation._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error("Admin donations PATCH error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update donation" }, { status: 500 })
  }
}
