import mongoose from "mongoose"

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  name: string
  category: string
  price: number
  quantity: number
  manufacturer: string
  expiryDate: Date
}

export interface IShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IOrder extends mongoose.Document {
  orderNumber: string
  userId?: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: IShippingAddress
  paymentMethod: "credit-card" | "paypal" | "bank-transfer"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  promoCode?: string
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new mongoose.Schema<IOrderItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
})

const ShippingAddressSchema = new mongoose.Schema<IShippingAddress>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: "United States" },
})

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [OrderItemSchema],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit-card", "paypal", "bank-transfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    promoCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
)

// Generate order number before saving
OrderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `VM${String(count + 1).padStart(6, "0")}`
  }
})

// Indexes
OrderSchema.index({ userId: 1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ orderStatus: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
