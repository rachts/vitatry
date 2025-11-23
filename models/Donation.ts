import mongoose, { Schema, type Document } from "mongoose"

export interface IDonation extends Document {
  donationId: string
  medicineName: string
  brand: string
  genericName?: string
  dosage: string
  quantity: number
  expiryDate: Date
  condition: "unopened" | "opened" | "partial"
  category: string
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress: string
  notes?: string
  images: string[]
  status: "pending" | "verified" | "rejected" | "distributed"
  isReserved: boolean
  reservedBy?: string
  createdAt: Date
  updatedAt: Date
}

const DonationSchema = new Schema<IDonation>(
  {
    donationId: { type: String, required: true, unique: true },
    medicineName: { type: String, required: true },
    brand: { type: String, required: true },
    genericName: String,
    dosage: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    expiryDate: { type: Date, required: true },
    condition: { type: String, enum: ["unopened", "opened", "partial"], required: true },
    category: { type: String, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true, lowercase: true },
    donorPhone: { type: String, required: true },
    donorAddress: { type: String, required: true },
    notes: String,
    images: [String],
    status: { type: String, enum: ["pending", "verified", "rejected", "distributed"], default: "pending" },
    isReserved: { type: Boolean, default: false },
    reservedBy: String,
  },
  { timestamps: true },
)

DonationSchema.index({ status: 1, createdAt: -1 })
DonationSchema.index({ donationId: 1 }, { unique: true })
DonationSchema.index({ category: 1 })
DonationSchema.index({ donorEmail: 1 })

export default mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema)
