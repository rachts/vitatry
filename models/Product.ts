import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  description?: string
  manufacturer: string
  category: string
  price: number
  quantity: number
  inStock: number
  expiryDate: Date
  image?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: String,
    manufacturer: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    inStock: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    image: String,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
)

ProductSchema.index({ verified: 1, inStock: 1 })
ProductSchema.index({ category: 1 })
ProductSchema.index({ manufacturer: 1 })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
