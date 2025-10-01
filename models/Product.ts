/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  inStock: number
  category: string
  imageUrl?: string
  verified: boolean
  verificationDate?: Date
  expiryDate?: Date
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 10, max: 200 },
    inStock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String },
    verified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    expiryDate: { type: Date },
  },
  { timestamps: true },
)

ProductSchema.index({ name: 1 })
ProductSchema.index({ verified: 1, inStock: 1 })
ProductSchema.index({ category: 1 })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
