export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Medicine from "@/models/Medicine"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const verified = searchParams.get("verified")
    const available = searchParams.get("available")

    await dbConnect()

    const query: any = {}
    if (category) {
      query.category = category
    }
    if (verified === "true") {
      query.verified = true
    }
    if (available === "true") {
      query.quantity = { $gt: 0 }
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      medicines,
    })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const body = await req.json()
    const { name, category, description, quantity, verified } = body

    if (!name || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const medicine = await Medicine.create({
      name,
      category,
      description,
      quantity: quantity || 0,
      verified: verified || false,
    })

    return NextResponse.json({
      success: true,
      message: "Medicine created successfully",
      medicine,
    })
  } catch (error) {
    console.error("Error creating medicine:", error)
    return NextResponse.json({ success: false, error: "Failed to create medicine" }, { status: 500 })
  }
}
