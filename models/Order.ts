import mongoose, { Schema, type Document } from "mongoose"

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  name: string
  category: string
  price: number
  quantity: number
  manufacturer: string
  expiryDate: Date
}

export interface IOrder extends Document {
  userId?: string
  items: IOrderItem[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: "credit_card" | "debit_card" | "upi" | "netbanking"
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  promoCode?: string
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: String,
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        manufacturer: { type: String, required: true },
        expiryDate: { type: Date, required: true },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "netbanking"],
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    promoCode: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true },
)

// Create indexes
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ orderStatus: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
