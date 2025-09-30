/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: "donation" | "volunteer" | "system" | "recall" | "achievement" | "donation_status"
  data?: Record<string, any>
  actionUrl?: string
  expiresAt?: Date
}

export class NotificationService {
  static async createNotification(notificationData: NotificationData): Promise<void> {
    await dbConnect()
    await Notification.create(notificationData)
  }

  static async createBulkNotifications(notifications: NotificationData[]): Promise<void> {
    await dbConnect()
    await Notification.insertMany(notifications)
  }

  static async markAsRead(userId: string, notificationId: string): Promise<void> {
    await dbConnect()
    await Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true })
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await dbConnect()
    await Notification.updateMany({ userId, read: false }, { read: true })
  }

  static async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ notifications: any[]; unreadCount: number }> {
    await dbConnect()
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit).skip(offset),
      Notification.countDocuments({ userId, read: false }),
    ])
    return { notifications, unreadCount }
  }

  static async notifyDonationStatusChange(
    userId: string,
    donationId: string,
    status: string,
    notes?: string,
  ): Promise<void> {
    const statusMessages: Record<string, { title: string; message: string }> = {
      verified: {
        title: "Donation Verified! 🎉",
        message: "Your medicine donation has been verified and approved. Thank you for making a difference!",
      },
      rejected: {
        title: "Donation Update",
        message: notes || "Your donation requires attention. Please check the details.",
      },
      collected: {
        title: "Donation Collected 📦",
        message: "Your donated medicines have been collected and are being processed.",
      },
      distributed: {
        title: "Impact Made! 💚",
        message: "Your donated medicines have been distributed to those in need. Thank you for your generosity!",
      },
    }

    const template = statusMessages[status]
    if (template) {
      await this.createNotification({
        userId,
        title: template.title,
        message: template.message,
        type: "donation_status",
        data: { donationId, status, notes },
        actionUrl: `/dashboard?tab=donations`,
      })
    }
  }
}

export async function createNotification(data: NotificationData) {
  return NotificationService.createNotification(data)
}

export async function notifyDonationStatusChange(userId: string, donationId: string, status: string, notes?: string) {
  return NotificationService.notifyDonationStatusChange(userId, donationId, status, notes)
}
