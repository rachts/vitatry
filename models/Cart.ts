import mongoose, { Schema, type Document } from "mongoose"

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  price: number
  addedAt: Date
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId
  sessionId?: string
  items: ICartItem[]
  totalAmount: number
  totalItems: number
  createdAt: Date
  updatedAt: Date
}

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: String,
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalAmount: { type: Number, default: 0, min: 0 },
    totalItems: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
)

// Create indexes
CartSchema.index({ userId: 1 }, { sparse: true })
CartSchema.index({ sessionId: 1 }, { sparse: true })
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days TTL

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema)
