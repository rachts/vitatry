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

const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema)

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await req.json()

    await dbConnect()

    const notification = await Notification.findByIdAndUpdate(id, body, { new: true })

    if (!notification) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      notification: {
        ...notification.toObject(),
        _id: notification._id?.toString(),
      },
    })
  } catch (error: any) {
    console.error("Notification PATCH error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update notification" },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    await Notification.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error: any) {
    console.error("Notification DELETE error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete notification" },
      { status: 500 },
    )
  }
}
