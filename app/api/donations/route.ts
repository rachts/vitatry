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
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const status = searchParams.get("status")

    const query: any = {}
    if (status) query.status = status

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
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const formData = await req.formData()

    const donationId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const imageUrls: string[] = []

    const imageFiles = formData.getAll("images")
    for (const file of imageFiles) {
      if (file instanceof File) {
        const blob = await put(`donations/${donationId}/${file.name}`, file, {
          access: "public",
        })
        imageUrls.push(blob.url)
      }
    }

    const donation = await Donation.create({
      donationId,
      medicineName: formData.get("medicineName"),
      brand: formData.get("brand"),
      genericName: formData.get("genericName") || undefined,
      dosage: formData.get("dosage"),
      quantity: Number(formData.get("quantity")),
      expiryDate: new Date(formData.get("expiryDate") as string),
      condition: formData.get("condition"),
      category: formData.get("category"),
      donorName: formData.get("donorName"),
      donorEmail: formData.get("donorEmail"),
      donorPhone: formData.get("donorPhone"),
      donorAddress: formData.get("donorAddress"),
      notes: formData.get("notes") || undefined,
      images: imageUrls,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      message: "Donation submitted successfully",
      donation: {
        donationId: donation.donationId,
        status: donation.status,
      },
    })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ success: false, error: "Failed to create donation" }, { status: 500 })
  }
}
