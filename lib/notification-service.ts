/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"

interface CreateNotificationInput {
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
}

export async function createNotification(input: CreateNotificationInput) {
  await dbConnect()
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data || {},
    read: false,
    createdAt: new Date(),
  })
  return notification
}

export async function getNotifications(userId: string, limit = 20) {
  await dbConnect()
  return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean()
}

export async function markAsRead(notificationId: string) {
  await dbConnect()
  return await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })
}

export async function markAllAsRead(userId: string) {
  await dbConnect()
  return await Notification.updateMany({ userId, read: false }, { read: true })
}

export class NotificationService {
  static async create(input: CreateNotificationInput) {
    return createNotification(input)
  }

  static async getForUser(userId: string, limit = 20) {
    return getNotifications(userId, limit)
  }

  static async markAsRead(notificationId: string) {
    return markAsRead(notificationId)
  }

  static async markAllAsRead(userId: string) {
    return markAllAsRead(userId)
  }
}
