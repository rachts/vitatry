import mongoose, { Schema, type Document } from "mongoose"

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId
  sessionId?: string
  items: Array<{
    productId: mongoose.Types.ObjectId
    quantity: number
    price: number
    addedAt: Date
  }>
  totalAmount: number
  totalItems: number
  createdAt: Date
  updatedAt: Date
}

const CartSchema = new Schema<ICart>(
  {
    userId: mongoose.Schema.Types.ObjectId,
    sessionId: String,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalAmount: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true },
)

CartSchema.index({ userId: 1 })
CartSchema.index({ sessionId: 1 })

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema)
