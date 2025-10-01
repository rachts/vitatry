/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import mongoose, { Schema, type Document } from "mongoose"

export interface IVolunteerApplication extends Document {
  name: string
  email: string
  phone: string
  role: string
  availability: string
  experience?: string
  motivation?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    availability: { type: String, required: true },
    experience: { type: String },
    motivation: { type: String },
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
)

VolunteerApplicationSchema.index({ email: 1 })
VolunteerApplicationSchema.index({ status: 1 })

export default mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>("VolunteerApplication", VolunteerApplicationSchema)
