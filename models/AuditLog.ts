import mongoose, { type Document, type Model } from "mongoose"

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: String,
  details: { type: mongoose.Schema.Types.Mixed, required: true },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low",
  },
})

// Index for efficient queries
AuditLogSchema.index({ userId: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, timestamp: -1 })
AuditLogSchema.index({ resource: 1, timestamp: -1 })

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)

export default AuditLog
