/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import dbConnect from "@/lib/dbConnect"
import AuditLog from "@/models/AuditLog"

interface AuditLogInput {
  userId: string
  action: string
  resourceType: string
  resourceId: string
  details?: Record<string, any>
}

export async function auditLog(input: AuditLogInput) {
  await dbConnect()
  const log = await AuditLog.create({
    userId: input.userId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    details: input.details || {},
    timestamp: new Date(),
  })
  return log
}

export async function getAuditLogs(filters: {
  userId?: string
  resourceType?: string
  action?: string
  limit?: number
}) {
  await dbConnect()
  const query: any = {}

  if (filters.userId) query.userId = filters.userId
  if (filters.resourceType) query.resourceType = filters.resourceType
  if (filters.action) query.action = filters.action

  return await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .limit(filters.limit || 50)
    .lean()
}
