/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import mongoose from "mongoose"

export interface IProduct extends mongoose.Document {
  name: string
  category: string
  price: number
  originalPrice?: number
  inStock: number
  description: string
  image: string
  expiryDate: Date
  manufacturer: string
  verified: boolean
  batchNumber?: string
  ndc?: string
  dosage?: string
  form: "tablet" | "capsule" | "liquid" | "injection" | "cream" | "other"
  prescriptionRequired: boolean
  activeIngredients: string[]
  sideEffects?: string[]
  contraindications?: string[]
  storageInstructions?: string
  donatedBy?: mongoose.Types.ObjectId
  verifiedBy?: mongoose.Types.ObjectId
  verificationDate?: Date
  aiVerificationScore?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      required: true,
      enum: [
        "Pain Relief",
        "Antibiotics",
        "Vitamins",
        "Diabetes",
        "Heart Disease",
        "Mental Health",
        "Respiratory",
        "Digestive",
        "Skin Care",
        "Eye Care",
        "Other",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: [10, "Price must be at least ₹10"],
      max: [200, "Price must not exceed ₹200"],
    },
    originalPrice: { type: Number, min: 0 },
    inStock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, required: true, maxlength: 1000 },
    image: { type: String, required: true },
    expiryDate: {
      type: Date,
      required: true,
      validate: { validator: (date: Date) => date > new Date(), message: "Expiry date must be in the future" },
    },
    manufacturer: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    batchNumber: { type: String, trim: true },
    ndc: { type: String, trim: true },
    dosage: { type: String, trim: true },
    form: { type: String, enum: ["tablet", "capsule", "liquid", "injection", "cream", "other"], default: "tablet" },
    prescriptionRequired: { type: Boolean, default: false },
    activeIngredients: [{ type: String, trim: true }],
    sideEffects: [{ type: String, trim: true }],
    contraindications: [{ type: String, trim: true }],
    storageInstructions: { type: String, trim: true },
    donatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verificationDate: { type: Date },
    aiVerificationScore: { type: Number, min: 0, max: 100 },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true },
)

ProductSchema.index({ category: 1, verified: 1 })
ProductSchema.index({ name: "text", description: "text" })
ProductSchema.index({ expiryDate: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ inStock: 1 })

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
