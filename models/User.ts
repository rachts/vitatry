import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  emailVerified?: Date
  image?: string
  role: "donor" | "volunteer" | "admin" | "ngo"
  status: "active" | "inactive" | "suspended"
  donationCount: number
  totalDonatedValue: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    emailVerified: Date,
    image: String,
    role: { type: String, enum: ["donor", "volunteer", "admin", "ngo"], default: "donor" },
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    donationCount: { type: Number, default: 0, min: 0 },
    totalDonatedValue: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

// Only define index if not already defined in schema
UserSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
