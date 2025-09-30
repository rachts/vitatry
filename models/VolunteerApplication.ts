import mongoose, { Schema, type Model } from "mongoose"

export interface VolunteerApplicationDoc extends mongoose.Document {
  fullName: string
  email: string
  phone: string
  location: string
  availability: string[]
  skills: string[]
  experience?: string
  motivation?: string
  role: "verifier" | "pickup_delivery" | "outreach" | "admin_support"
  status: "submitted" | "under_review" | "approved" | "rejected"
  userId?: string
  createdAt: Date
  updatedAt: Date
}

const VolunteerApplicationSchema = new Schema<VolunteerApplicationDoc>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, index: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    roles: { type: [String], default: [] },
    availability: { type: [String], required: true },
    skills: { type: [String], required: true },
    notes: { type: String },
    experience: { type: String, required: false },
    motivation: { type: String, required: false },
    role: {
      type: String,
      enum: ["verifier", "pickup_delivery", "outreach", "admin_support"],
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected"],
      default: "submitted",
    },
    userId: { type: String, index: true, required: false },
  },
  {
    timestamps: true,
    collection: "volunteer_applications", // Explicitly set collection name
  },
)

// Add indexes
VolunteerApplicationSchema.index({ createdAt: -1 })
VolunteerApplicationSchema.index({ status: 1 })
VolunteerApplicationSchema.index({ email: 1 })

export default (mongoose.models.VolunteerApplication as Model<VolunteerApplicationDoc>) ||
  mongoose.model<VolunteerApplicationDoc>("VolunteerApplication", VolunteerApplicationSchema)
