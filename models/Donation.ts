import mongoose, { type Document, Schema } from "mongoose"

export interface IDonation extends Document {
  donationId: string
  medicineName: string
  brand: string
  genericName?: string
  dosage: string
  quantity: number
  expiryDate: Date
  condition: "new" | "opened_unused" | "partially_used"
  category: "pain_relief" | "antibiotics" | "vitamins" | "chronic_disease" | "other"
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress: string
  notes?: string
  images: string[]
  status: "pending" | "verified" | "rejected" | "distributed"
  verificationNotes?: string
  verifiedBy?: string
  verifiedAt?: Date
  distributedTo?: string
  distributedAt?: Date
  isReserved: boolean
  reservedBy?: string
  reservedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DonationSchema = new Schema<IDonation>(
  {
    donationId: {
      type: String,
      required: true,
      unique: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    expiryDate: {
      type: Date,
      required: true,
      validate: {
        validator: (date: Date) => {
          const sixMonthsFromNow = new Date()
          sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
          return date > sixMonthsFromNow
        },
        message: "Medicine must have at least 6 months before expiry",
      },
    },
    condition: {
      type: String,
      required: true,
      enum: ["new", "opened_unused", "partially_used"],
    },
    category: {
      type: String,
      required: true,
      enum: ["pain_relief", "antibiotics", "vitamins", "chronic_disease", "other"],
    },
    donorName: {
      type: String,
      required: true,
      trim: true,
    },
    donorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    donorPhone: {
      type: String,
      required: true,
      trim: true,
    },
    donorAddress: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["pending", "verified", "rejected", "distributed"],
      default: "pending",
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    distributedTo: {
      type: String,
      trim: true,
    },
    distributedAt: {
      type: Date,
    },
    isReserved: {
      type: Boolean,
      default: false,
    },
    reservedBy: {
      type: String,
      trim: true,
    },
    reservedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

DonationSchema.index({ donationId: 1 })
DonationSchema.index({ status: 1, isReserved: 1 })
DonationSchema.index({ category: 1, status: 1 })
DonationSchema.index({ donorEmail: 1 })
DonationSchema.index({ createdAt: -1 })

export default mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema)
