/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type mongoose from "mongoose"
import { Schema, type InferSchemaType, models, model } from "mongoose"

const MedicineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String }],
    expiryDate: { type: Date, required: true },
    inStock: { type: Number, default: 1, min: 0 },
    price: { type: Number, min: 10, max: 200 },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    donatedByEmail: { type: String },
  },
  { timestamps: true },
)

export type MedicineDoc = InferSchemaType<typeof MedicineSchema>
export default (models.Medicine as mongoose.Model<MedicineDoc>) || model<MedicineDoc>("Medicine", MedicineSchema)
