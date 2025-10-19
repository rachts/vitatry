import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  description?: string
  category: string
  price: number
  inStock: number
  image?: string
  manufacturer: string
  expiryDate: Date
  dosage?: string
  verified: boolean
  donationId?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    inStock: { type: Number, required: true, default: 0, min: 0 },
    image: String,
    manufacturer: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    dosage: String,
    verified: { type: Boolean, default: false },
    donationId: String,
  },
  { timestamps: true },
)

// Create indexes
ProductSchema.index({ name: "text", description: "text" })
ProductSchema.index({ category: 1, verified: 1 })
ProductSchema.index({ expiryDate: 1 })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
