import mongoose, { type Document, type Model } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  message: string
  type: "donation" | "volunteer" | "system" | "recall" | "achievement"
  data?: Record<string, any>
  read: boolean
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["donation", "volunteer", "system", "recall", "achievement"],
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    actionUrl: String,
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
