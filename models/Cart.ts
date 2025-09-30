import mongoose from "mongoose"

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  price: number
  addedAt: Date
}

export interface ICart extends mongoose.Document {
  userId?: mongoose.Types.ObjectId
  sessionId?: string
  items: ICartItem[]
  totalAmount: number
  totalItems: number
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new mongoose.Schema<ICartItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

const CartSchema = new mongoose.Schema<ICart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      trim: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
  },
)

// Ensure either userId or sessionId is present
CartSchema.pre("save", function () {
  if (!this.userId && !this.sessionId) {
    throw new Error("Either userId or sessionId must be provided")
  }
})

// Calculate totals before saving
CartSchema.pre("save", function () {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0)
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// Indexes
CartSchema.index({ userId: 1 })
CartSchema.index({ sessionId: 1 })
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema)
