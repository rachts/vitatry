import mongoose, { Schema, Document, Model } from "mongoose"

// 🧾 Order Interface
export interface IOrder extends Document {
  orderNumber: string
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
  }
  paymentMethod: "cod" | "card" | "upi" | string
  createdAt: Date
  updatedAt: Date
}

// 🏗️ Schema Definition
const OrderSchema: Schema<IOrder> = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "card", "upi"],
      default: "cod",
    },
  },
  { timestamps: true }
)

// ✅ Indexes for faster queries
OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ orderNumber: 1 })

// ⚡ Hot reload safe export
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)

export default Order
