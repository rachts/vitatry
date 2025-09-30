import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { auditLog } from "@/lib/audit-service"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { role, isActive, verificationLevel } = body

    await dbConnect()
    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const oldData = {
      role: user.role,
      isActive: user.isActive,
      verificationLevel: user.profile?.verificationLevel,
    }

    const updates: any = {
      updatedAt: new Date(),
    }

    if (role) {
      updates.role = role
    }
    if (typeof isActive === "boolean") {
      updates.isActive = isActive
    }
    if (verificationLevel) {
      updates["profile.verificationLevel"] = verificationLevel
    }

    const updatedUser = await User.findByIdAndUpdate(params.id, updates, { new: true }).select("-password")

    // Create audit log
    await auditLog({
      userId: session.user.id,
      action: "user_updated",
      resourceType: "user",
      resourceId: params.id,
      details: {
        oldData,
        newData: {
          role,
          isActive,
          verificationLevel,
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const user = await User.findById(params.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't allow deleting other admins
    if (user.role === "admin" && user._id.toString() !== session.user.id) {
      return NextResponse.json({ error: "Cannot delete other admin users" }, { status: 403 })
    }

    await User.findByIdAndDelete(params.id)

    // Create audit log
    await auditLog({
      userId: session.user.id,
      action: "user_deleted",
      resourceType: "user",
      resourceId: params.id,
      details: {
        deletedUser: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
