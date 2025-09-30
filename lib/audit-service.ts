/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import dbConnect from "@/lib/dbConnect"
import AuditLog from "@/models/AuditLog"

export interface AuditLogData {
  userId: string
  action: string
  resourceType: string
  resourceId: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function auditLog(data: AuditLogData): Promise<void> {
  try {
    await dbConnect()
    await AuditLog.create({
      ...data,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function getUserActivity(userId: string, limit = 50): Promise<any[]> {
  await dbConnect()
  return await AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean()
}

export async function getResourceActivity(resourceType: string, resourceId: string): Promise<any[]> {
  await dbConnect()
  return await AuditLog.find({ resourceType, resourceId })
    .populate("userId", "name email")
    .sort({ timestamp: -1 })
    .lean()
}

export async function getSystemActivity(limit = 100): Promise<any[]> {
  await dbConnect()
  return await AuditLog.find().populate("userId", "name email").sort({ timestamp: -1 }).limit(limit).lean()
}
