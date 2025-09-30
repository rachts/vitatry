import { NextResponse, type NextRequest } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"

// GET latest donations (limit 20)
export async function GET() {
  try {
    await dbConnect()
    const items = await Donation.find().sort({ createdAt: -1 }).limit(20).lean()
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to fetch donations" }, { status: 500 })
  }
}

// Accept JSON or multipart/form-data for POST
export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const contentType = req.headers.get("content-type") || ""
    let payload: any = {}

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData()
      payload = {
        name: String(fd.get("medicineName") || ""),
        brand: String(fd.get("brand") || ""),
        expiryDate: new Date(String(fd.get("expiryDate") || "")),
        quantity: Number(fd.get("quantity") || 1),
        conditionNotes: String(fd.get("conditionNotes") || ""),
        pickupAddress: String(fd.get("pickupAddress") || ""),
        donorName: String(fd.get("donorName") || ""),
        donorEmail: String(fd.get("donorEmail") || ""),
        donorPhone: String(fd.get("donorPhone") || ""),
        images: [],
        status: "submitted",
      }

      // Collect up to 5 images as filenames (no external storage dependency)
      const images: string[] = []
      Array.from(fd.keys())
        .filter((k) => k.startsWith("image"))
        .slice(0, 5)
        .forEach((key) => {
          const file = fd.get(key)
          if (file instanceof File && file.size > 0) {
            const ext = file.name.split(".").pop() || "jpg"
            const pseudoName = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            images.push(pseudoName)
          }
        })
      payload.images = images
    } else {
      const body = await req.json()
      payload = {
        name: String(body.medicineName || body.name || ""),
        brand: body.brand || "",
        expiryDate: new Date(body.expiryDate),
        quantity: Number(body.quantity || 1),
        conditionNotes: body.conditionNotes || "",
        pickupAddress: body.pickupAddress || "",
        donorName: body.donorName || "",
        donorEmail: body.donorEmail || "",
        donorPhone: body.donorPhone || "",
        images: Array.isArray(body.images) ? body.images : [],
        status: "submitted",
        userId: body.userId || null,
      }
    }

    // Validate required fields
    if (!payload.name || !payload.expiryDate || !payload.quantity || !payload.pickupAddress) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, expiryDate, quantity, pickupAddress" },
        { status: 400 },
      )
    }

    // Validate expiry date (6+ months)
    const expiryDate = new Date(payload.expiryDate)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    if (expiryDate < sixMonthsFromNow) {
      return NextResponse.json(
        { success: false, message: "Medicine must have at least 6 months before expiry" },
        { status: 400 },
      )
    }

    const created = await Donation.create(payload)
    return NextResponse.json({
      success: true,
      donationId: created._id,
      message: "Donation submitted successfully!",
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Failed to submit donation" }, { status: 500 })
  }
}
