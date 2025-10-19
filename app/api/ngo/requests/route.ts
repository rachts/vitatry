import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const MedicineRequestSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  medicineType: { type: String, required: true },
  quantity: { type: Number, required: true },
  urgency: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "fulfilled", "rejected"], default: "pending" },
  location: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

MedicineRequestSchema.index({ ngoId: 1 })
MedicineRequestSchema.index({ status: 1 })

const MedicineRequest = mongoose.models.MedicineRequest || mongoose.model("MedicineRequest", MedicineRequestSchema)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ngo_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const requests = await MedicineRequest.find({ ngoId: session.user.id }).sort({ requestedAt: -1 })

    return NextResponse.json({ success: true, requests })
  } catch (error: any) {
    console.error("NGO requests GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ngo_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()

    if (!data.medicineType || !data.quantity || !data.reason || !data.location) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()
    const request = await MedicineRequest.create({
      ngoId: session.user.id,
      medicineType: data.medicineType,
      quantity: data.quantity,
      urgency: data.urgency || "medium",
      reason: data.reason,
      location: data.location,
    })

    return NextResponse.json({ success: true, request })
  } catch (error: any) {
    console.error("NGO requests POST error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create request" }, { status: 500 })
  }
}
