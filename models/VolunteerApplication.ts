import mongoose, { Schema, type Document } from "mongoose"

export interface IVolunteerApplication extends Document {
  name: string
  email: string
  phone: string
  city: string
  address: string
  experience: "beginner" | "intermediate" | "experienced"
  roles: string[]
  availability: string[]
  motivation: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    experience: { type: String, enum: ["beginner", "intermediate", "experienced"], default: "beginner" },
    roles: [String],
    availability: [String],
    motivation: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true },
)

VolunteerApplicationSchema.index({ status: 1 })
VolunteerApplicationSchema.index({ email: 1 })

export default mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>("VolunteerApplication", VolunteerApplicationSchema)
