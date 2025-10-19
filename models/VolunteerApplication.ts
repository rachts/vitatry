import mongoose, { Schema, type Document } from "mongoose"

export interface IVolunteerApplication extends Document {
  name: string
  email: string
  phone: string
  role: "verifier" | "collector" | "distributor" | "admin"
  availability: "fulltime" | "parttime" | "weekends"
  experience?: string
  motivation?: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ["verifier", "collector", "distributor", "admin"],
      required: true,
    },
    availability: {
      type: String,
      enum: ["fulltime", "parttime", "weekends"],
      required: true,
    },
    experience: String,
    motivation: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true },
)

// Create indexes
VolunteerApplicationSchema.index({ email: 1 }, { unique: true })
VolunteerApplicationSchema.index({ status: 1, createdAt: -1 })

export default mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>("VolunteerApplication", VolunteerApplicationSchema)
