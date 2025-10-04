export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import { put } from "@vercel/blob"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    await dbConnect()

    const query: any = {}
    if (status) {
      query.status = status
    }

    if (session?.user?.role === "donor") {
      query.donorEmail = session.user.email
    }

    const total = await Donation.countDocuments(query)
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({
      success: true,
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
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    await dbConnect()

    const formData = await req.formData()

    const donorName = formData.get("donorName") as string
    const donorEmail = formData.get("donorEmail") as string
    const donorPhone = formData.get("donorPhone") as string
    const donorAddress = formData.get("donorAddress") as string
    const medicineName = formData.get("medicineName") as string
    const brand = formData.get("brand") as string
    const genericName = formData.get("genericName") as string
    const dosage = formData.get("dosage") as string
    const quantity = Number.parseInt(formData.get("quantity") as string, 10)
    const expiryDate = new Date(formData.get("expiryDate") as string)
    const condition = formData.get("condition") as string
    const category = formData.get("category") as string
    const notes = formData.get("notes") as string

    const imageUrls: string[] = []
    const imageFiles = formData.getAll("images") as File[]

    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const blob = await put(file.name, file, {
          access: "public",
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
        imageUrls.push(blob.url)
      }
    }

    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    const donation = await Donation.create({
      donationId,
      medicineName,
      brand,
      genericName,
      dosage,
      quantity,
      expiryDate,
      condition,
      category,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      notes,
      images: imageUrls,
      status: "pending",
      isReserved: false,
    })

    return NextResponse.json({
      success: true,
      message: "Donation submitted successfully",
      donation,
    })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ success: false, error: "Failed to create donation" }, { status: 500 })
  }
}
