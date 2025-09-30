import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Define MedicineRequest model
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

const MedicineRequest = mongoose.models.MedicineRequest || mongoose.model("MedicineRequest", MedicineRequestSchema)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an NGO partner
    if (session.user.role !== "ngo_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const requests = await MedicineRequest.find({ ngoId: session.user.id }).sort({ requestedAt: -1 })

    return NextResponse.json({ requests })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an NGO partner
    if (session.user.role !== "ngo_partner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const data = await req.json()

    await dbConnect()
    const request = await MedicineRequest.create({
      ngoId: session.user.id,
      medicineType: data.medicineType,
      quantity: data.quantity,
      urgency: data.urgency,
      reason: data.reason,
      location: data.location,
    })

    return NextResponse.json({ success: true, request })
  } catch (error) {
    return handleApiError(error)
  }
}
