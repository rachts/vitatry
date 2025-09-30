import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    await dbConnect()

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }
    if (search) {
      query.$or = [
        { "donorInfo.name": { $regex: search, $options: "i" } },
        { "donorInfo.email": { $regex: search, $options: "i" } },
        { "medicines.name": { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await Donation.countDocuments(query)

    // Get donations with pagination
    const donations = await Donation.find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .populate("reviewedBy", "name email")

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { donationIds, action, status, reviewNotes } = body

    if (!donationIds || !Array.isArray(donationIds) || donationIds.length === 0) {
      return NextResponse.json({ error: "Invalid donation IDs" }, { status: 400 })
    }

    await dbConnect()

    const updates: any = {
      updatedAt: new Date(),
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    }

    if (status) {
      updates.status = status
    }
    if (reviewNotes) {
      updates.reviewNotes = reviewNotes
    }

    const result = await Donation.updateMany({ _id: { $in: donationIds } }, updates)

    return NextResponse.json({
      message: `${result.modifiedCount} donations updated successfully`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error bulk updating donations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
