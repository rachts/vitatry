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

export class AuditService {
  static async log(data: AuditLogData): Promise<void> {
    try {
      await dbConnect()
      await AuditLog.create({
        ...data,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Failed to create audit log:", error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  static async getUserActivity(userId: string, limit = 50): Promise<any[]> {
    await dbConnect()
    return await AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean()
  }

  static async getResourceActivity(resourceType: string, resourceId: string): Promise<any[]> {
    await dbConnect()
    return await AuditLog.find({ resourceType, resourceId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .lean()
  }

  static async getSystemActivity(limit = 100): Promise<any[]> {
    await dbConnect()
    return await AuditLog.find().populate("userId", "name email").sort({ timestamp: -1 }).limit(limit).lean()
  }

  static async getActivityByAction(action: string, limit = 50): Promise<any[]> {
    await dbConnect()
    return await AuditLog.find({ action }).populate("userId", "name email").sort({ timestamp: -1 }).limit(limit).lean()
  }

  static async getActivityStats(startDate: Date, endDate: Date): Promise<any> {
    await dbConnect()

    const stats = await AuditLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])

    const totalActions = await AuditLog.countDocuments({
      timestamp: { $gte: startDate, $lte: endDate },
    })

    const uniqueUsers = await AuditLog.distinct("userId", {
      timestamp: { $gte: startDate, $lte: endDate },
    })

    return {
      totalActions,
      uniqueUsers: uniqueUsers.length,
      actionBreakdown: stats,
    }
  }
}
