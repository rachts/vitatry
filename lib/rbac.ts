import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { ApiError } from "./api-error"

export interface Permission {
  resource: string
  action: string
}

export class RBAC {
  private static rolePermissions: Record<string, string[]> = {
    admin: ["read:all", "write:all", "delete:all", "manage:users", "manage:system"],
    reviewer: ["read:donations", "write:donations", "verify:medicines", "read:analytics", "update:donation_status"],
    ngo_partner: ["read:donations", "request:medicines", "read:analytics", "read:verified_medicines"],
    volunteer: ["read:donations", "update:volunteer_tasks", "read:own", "write:own"],
    donor: ["read:own", "write:own", "create:donations"],
  }

  static async checkPermission(req: NextRequest, requiredPermission: string): Promise<boolean> {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return false
    }

    const userRole = session.user.role
    const userPermissions = this.rolePermissions[userRole] || []

    return (
      userPermissions.includes(requiredPermission) ||
      userPermissions.includes("write:all") ||
      userPermissions.includes("read:all")
    )
  }

  static async requirePermission(req: NextRequest, requiredPermission: string): Promise<void> {
    const hasPermission = await this.checkPermission(req, requiredPermission)

    if (!hasPermission) {
      throw new ApiError("Insufficient permissions", 403)
    }
  }

  static async requireRole(req: NextRequest, allowedRoles: string[]): Promise<void> {
    const session = await getServerSession(authOptions)

    if (!session?.user || !allowedRoles.includes(session.user.role)) {
      throw new ApiError("Insufficient permissions", 403)
    }
  }
}
