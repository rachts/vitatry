import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const formData = await req.formData()

    const medicineName = formData.get("medicineName")?.toString().trim()
    const brand = formData.get("brand")?.toString().trim()
    const genericName = formData.get("genericName")?.toString().trim()
    const dosage = formData.get("dosage")?.toString().trim()
    const quantityStr = formData.get("quantity")?.toString()
    const expiryDateStr = formData.get("expiryDate")?.toString()
    const condition = formData.get("condition")?.toString()
    const category = formData.get("category")?.toString()
    const donorName = formData.get("donorName")?.toString().trim()
    const donorEmail = formData.get("donorEmail")?.toString().trim().toLowerCase()
    const donorPhone = formData.get("donorPhone")?.toString().trim()
    const donorAddress = formData.get("donorAddress")?.toString().trim()
    const notes = formData.get("notes")?.toString().trim()

    // Validate required fields
    if (!medicineName || !brand || !dosage || !quantityStr || !expiryDateStr || !condition || !category) {
      return NextResponse.json({ success: false, error: "Missing required medicine fields" }, { status: 400 })
    }

    if (!donorName || !donorEmail || !donorPhone || !donorAddress) {
      return NextResponse.json({ success: false, error: "Missing required donor information" }, { status: 400 })
    }

    // Validate quantity
    const quantity = Number.parseInt(quantityStr)
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json({ success: false, error: "Quantity must be a positive number" }, { status: 400 })
    }

    // Validate expiry date
    const expiryDate = new Date(expiryDateStr)
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid expiry date" }, { status: 400 })
    }

    if (expiryDate <= new Date()) {
      return NextResponse.json({ success: false, error: "Medicine has already expired" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(donorEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Upload images
    const images: string[] = []
    const imageFiles = formData.getAll("images") as File[]

    for (const file of imageFiles) {
      try {
        if (file && file.size > 0) {
          const blob = await put(file.name, file, { access: "public" })
          images.push(blob.url)
        }
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError)
        return NextResponse.json(
          { success: false, error: "Failed to upload image. Please try again." },
          { status: 500 },
        )
      }
    }

    // Create donation record
    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const donation = await Donation.create({
      donationId,
      medicineName,
      brand,
      genericName: genericName || undefined,
      dosage,
      quantity,
      expiryDate,
      condition,
      category,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      notes: notes || undefined,
      images,
      status: "pending",
      isReserved: false,
    })

    return NextResponse.json(
      {
        success: true,
        donation: {
          ...donation.toObject(),
          _id: donation._id?.toString(),
        },
        message: "Donation submitted successfully. Our team will verify it shortly.",
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating donation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create donation. Please try again.",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: Record<string, any> = {}
    if (status && ["pending", "verified", "rejected", "distributed"].includes(status)) {
      query.status = status
    }
    if (category) {
      query.category = category
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
  } catch (error: any) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch donations" }, { status: 500 })
  }
}
