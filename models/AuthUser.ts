/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import mongoose from "mongoose"

export interface IAuthUser extends mongoose.Document {
  name: string
  email: string
  passwordHash: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

const AuthUserSchema = new mongoose.Schema<IAuthUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
)

export default mongoose.models.AuthUser || mongoose.model<IAuthUser>("AuthUser", AuthUserSchema)
