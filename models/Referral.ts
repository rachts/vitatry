import mongoose, { type Document, type Model } from "mongoose"

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId
  refereeId?: mongoose.Types.ObjectId
  refereeEmail: string
  referralCode: string
  status: "pending" | "completed" | "expired"
  rewardClaimed: boolean
  rewardAmount: number
  createdAt: Date
  completedAt?: Date
}

const ReferralSchema = new mongoose.Schema<IReferral>(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    refereeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refereeEmail: { type: String, required: true },
    referralCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed", "expired"],
      default: "pending",
    },
    rewardClaimed: { type: Boolean, default: false },
    rewardAmount: { type: Number, default: 50 }, // Credits
    completedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
ReferralSchema.index({ referrerId: 1, refereeEmail: 1 })

export default (mongoose.models.Referral as Model<IReferral>) || mongoose.model<IReferral>("Referral", ReferralSchema)
