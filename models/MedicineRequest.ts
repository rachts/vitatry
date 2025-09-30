import mongoose, { type Document, type Model } from "mongoose"

export interface IMedicineRequest extends Document {
  ngoId: mongoose.Types.ObjectId
  requestedMedicines: Array<{
    name: string
    quantity: number
    urgency: "low" | "medium" | "high" | "critical"
    description?: string
  }>
  status: "pending" | "approved" | "fulfilled" | "rejected"
  justification: string
  targetBeneficiaries: number
  location: {
    address: string
    city: string
    state: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  fulfilledAt?: Date
  rejectionReason?: string
  priority: number
  createdAt: Date
  updatedAt: Date
}

const MedicineRequestSchema = new mongoose.Schema<IMedicineRequest>(
  {
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestedMedicines: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        urgency: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
          default: "medium",
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "approved", "fulfilled", "rejected"],
      default: "pending",
    },
    justification: { type: String, required: true },
    targetBeneficiaries: { type: Number, required: true },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    fulfilledAt: Date,
    rejectionReason: String,
    priority: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  },
)

// Indexes
MedicineRequestSchema.index({ ngoId: 1, status: 1 })
MedicineRequestSchema.index({ status: 1, priority: -1 })

const MedicineRequest: Model<IMedicineRequest> =
  mongoose.models.MedicineRequest || mongoose.model<IMedicineRequest>("MedicineRequest", MedicineRequestSchema)

export default MedicineRequest
