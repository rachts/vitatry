import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["donation", "volunteer", "order", "system"], default: "system" },
  read: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
  actionUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
})

NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ read: 1 })

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema)

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const notifications = await Notification.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(50).lean()

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        ...n,
        _id: n._id?.toString(),
      })),
    })
  } catch (error: any) {
    console.error("Notifications GET error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch notifications" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    await dbConnect()

    const notification = await Notification.create({
      userId: session.user.id,
      ...body,
    })

    return NextResponse.json({
      success: true,
      notification: {
        ...notification.toObject(),
        _id: notification._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error("Notifications POST error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create notification" },
      { status: 500 },
    )
  }
}
