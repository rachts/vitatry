import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const formData = await req.formData()

    const medicineName = formData.get("medicineName") as string
    const brand = formData.get("brand") as string
    const genericName = formData.get("genericName") as string
    const dosage = formData.get("dosage") as string
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const expiryDate = new Date(formData.get("expiryDate") as string)
    const condition = formData.get("condition") as string
    const category = formData.get("category") as string
    const donorName = formData.get("donorName") as string
    const donorEmail = formData.get("donorEmail") as string
    const donorPhone = formData.get("donorPhone") as string
    const donorAddress = formData.get("donorAddress") as string
    const notes = formData.get("notes") as string

    if (!medicineName || !brand || !dosage || !quantity || !expiryDate || !condition || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (!donorName || !donorEmail || !donorPhone || !donorAddress) {
      return NextResponse.json({ success: false, error: "Missing donor information" }, { status: 400 })
    }

    const images: string[] = []
    const imageFiles = formData.getAll("images") as File[]

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const blob = await put(file.name, file, {
          access: "public",
        })
        images.push(blob.url)
      }
    }

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

    return NextResponse.json({
      success: true,
      donation: {
        ...donation.toObject(),
        _id: donation._id.toString(),
      },
      message: "Donation submitted successfully",
    })
  } catch (error: any) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create donation" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const query: any = {}
    if (status) query.status = status
    if (category) query.category = category

    const donations = await Donation.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      donations: donations.map((d) => ({
        ...d,
        _id: d._id.toString(),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching donations:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch donations" }, { status: 500 })
  }
}
