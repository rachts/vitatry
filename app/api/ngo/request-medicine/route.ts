import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import mongoose from "mongoose"
import { NotificationService } from "@/lib/notification-service"

// Define MedicineDistribution model
const MedicineDistributionSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: "Donation", required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ["requested", "approved", "shipped", "delivered"], default: "requested" },
  requestedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const MedicineDistribution =
  mongoose.models.MedicineDistribution || mongoose.model("MedicineDistribution", MedicineDistributionSchema)

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

    const { medicineId, quantity } = await req.json()

    // Parse the composite ID to get donation ID and medicine ID
    const [donationId, actualMedicineId] = medicineId.split("-")

    await dbConnect()

    // Check if medicine is available
    const donation = await Donation.findById(donationId)
    if (!donation || donation.status !== "verified") {
      return NextResponse.json({ error: "Medicine not available" }, { status: 400 })
    }

    // Find the specific medicine in the donation
    const medicine = donation.medicines.id(actualMedicineId)
    if (!medicine || medicine.quantity < quantity) {
      return NextResponse.json({ error: "Insufficient quantity available" }, { status: 400 })
    }

    // Create distribution request
    const distribution = await MedicineDistribution.create({
      ngoId: session.user.id,
      donationId,
      medicineId: actualMedicineId,
      quantity,
    })

    // Reserve the medicine
    medicine.quantity -= quantity
    if (medicine.quantity === 0) {
      donation.medicines.pull(actualMedicineId)
    }

    if (donation.medicines.length === 0) {
      donation.status = "distributed"
    } else {
      donation.isReserved = true
    }

    await donation.save()

    // Notify the donor
    await NotificationService.createNotification({
      userId: donation.userId.toString(),
      title: "Medicine Requested",
      message: `An NGO has requested ${quantity} units of ${medicine.name} from your donation.`,
      type: "donation",
      data: { donationId, medicineId: actualMedicineId },
      actionUrl: `/dashboard?tab=donations`,
    })

    return NextResponse.json({ success: true, distribution })
  } catch (error) {
    return handleApiError(error)
  }
}
