import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"
import { handleApiError, validateRequired } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import { verifyApiKey } from "@/lib/api-auth"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await limiter(req)
    if (rateLimitResult) return rateLimitResult

    // Check authentication - either session or API key
    const session = await getServerSession(authOptions)
    const apiKeyAuth = await verifyApiKey(req)

    if (!session?.user?.id && !apiKeyAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await req.json()
    validateRequired(data, ["firstName", "lastName", "email", "medicines"])

    const donation = await Donation.create({
      ...data,
      userId: session?.user?.id || apiKeyAuth?.userId,
      status: "pending",
      creditsEarned: 0,
    })

    return NextResponse.json({ message: "Donation submitted successfully", id: donation._id }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await limiter(req)
    if (rateLimitResult) return rateLimitResult

    // Check authentication - either session or API key
    const session = await getServerSession(authOptions)
    const apiKeyAuth = await verifyApiKey(req)

    if (!session?.user?.id && !apiKeyAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // If using API key, only return donations for the associated user
    // If admin user, return all donations
    // Otherwise, return only the user's donations
    const query: any = {}

    if (apiKeyAuth) {
      query.userId = apiKeyAuth.userId
    } else if (session?.user?.role !== "admin") {
      query.userId = session.user.id
    }

    if (status) query.status = status

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    const total = await Donation.countDocuments(query)

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
    return handleApiError(error)
  }
}
