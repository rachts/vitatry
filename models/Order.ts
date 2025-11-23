import mongoose, { Schema, type Document } from "mongoose"

export interface IOrder extends Document {
  orderId: string
  userId?: mongoose.Types.ObjectId
  items: Array<{
    productId: mongoose.Types.ObjectId
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "completed" | "failed"
  paymentId?: string
  shippingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: mongoose.Schema.Types.ObjectId,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    paymentId: String,
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  { timestamps: true },
)

OrderSchema.index({ orderId: 1 }, { unique: true })
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
