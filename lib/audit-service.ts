/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import dbConnect from "@/lib/dbConnect"
import AuditLog from "@/models/AuditLog"

interface AuditLogData {
  userId?: string
  action: string
  resourceType: string
  resourceId?: string
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

export async function getAuditLogs(
  filters: {
    userId?: string
    resourceType?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
  },
  limit = 100,
  offset = 0,
) {
  await dbConnect()
  const query: any = {}

  if (filters.userId) query.userId = filters.userId
  if (filters.resourceType) query.resourceType = filters.resourceType
  if (filters.resourceId) query.resourceId = filters.resourceId
  if (filters.startDate || filters.endDate) {
    query.timestamp = {}
    if (filters.startDate) query.timestamp.$gte = filters.startDate
    if (filters.endDate) query.timestamp.$lte = filters.endDate
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query).sort({ timestamp: -1 }).limit(limit).skip(offset),
    AuditLog.countDocuments(query),
  ])

  return { logs, total }
}
