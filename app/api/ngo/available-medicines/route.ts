import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    await dbConnect()

    const docs = await Donation.find({ status: "verified" })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("medicineName brand quantity expiryDate images")
      .lean()

    const items = docs.map((d: any) => ({
      id: d._id?.toString(),
      name: d.medicineName,
      brand: d.brand || "",
      quantity: d.quantity,
      expiryDate: d.expiryDate,
      image: Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : "/medicine-still-life.png",
      createdAt: d.createdAt,
    }))

    return NextResponse.json({ success: true, items, count: items.length })
  } catch (err: any) {
    console.error("NGO available medicines error:", err)
    return NextResponse.json({ success: false, message: err.message || "Failed to load medicines" }, { status: 500 })
  }
}
