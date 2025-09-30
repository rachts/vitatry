import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

// Public endpoint: list verified medicines available for NGOs and public browsing
export async function GET() {
  try {
    await dbConnect()

    // Only show medicines that are verified (ready for distribution)
    const docs = await Donation.find({ status: "verified" })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("name brand quantity expiryDate images createdAt")
      .lean()

    const items = docs.map((d) => ({
      id: String((d as any)._id),
      name: d.name,
      brand: d.brand || "",
      quantity: d.quantity,
      expiryDate: d.expiryDate,
      image: Array.isArray(d.images) && d.images.length > 0 ? d.images[0] : "/medicine-still-life.png",
      createdAt: d.createdAt,
    }))

    return NextResponse.json({ success: true, items, count: items.length })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to load medicines" }, { status: 500 })
  }
}
