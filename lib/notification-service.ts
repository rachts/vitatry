import dbConnect from "@/lib/dbConnect"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { queue } from "@/lib/queue"
import mongoose from "mongoose"

export interface NotificationData {
  userId: string
  title: string
  message: string
  type: "donation" | "volunteer" | "system" | "recall" | "achievement"
  data?: Record<string, any>
  actionUrl?: string
  expiresAt?: Date
}

export class NotificationService {
  static async createNotification(notificationData: NotificationData): Promise<void> {
    await dbConnect()

    const notification = await Notification.create(notificationData)

    // Queue push notification if user has enabled them
    const user = await User.findById(notificationData.userId)
    if (user?.profile?.pushNotifications) {
      queue.addJob("send-push-notification", {
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        actionUrl: notificationData.actionUrl,
      })
    }
  }

  static async createBulkNotifications(notifications: NotificationData[]): Promise<void> {
    await dbConnect()
    await Notification.insertMany(notifications)

    // Queue bulk push notifications
    for (const notification of notifications) {
      const user = await User.findById(notification.userId)
      if (user?.profile?.pushNotifications) {
        queue.addJob("send-push-notification", {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          actionUrl: notification.actionUrl,
        })
      }
    }
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

  static async getNotification(id: string): Promise<any> {
    await dbConnect()
    return await Notification.findById(id)
  }

  // Predefined notification templates
  static async notifyDonationStatusChange(
    userId: string,
    donationId: string,
    status: string,
    notes?: string,
  ): Promise<void> {
    const statusMessages = {
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

    const template = statusMessages[status as keyof typeof statusMessages]
    if (template) {
      await this.createNotification({
        userId,
        title: template.title,
        message: template.message,
        type: "donation",
        data: { donationId, status, notes },
        actionUrl: `/dashboard?tab=donations`,
      })
    }
  }

  static async notifyAchievement(userId: string, achievement: string, description: string): Promise<void> {
    await this.createNotification({
      userId,
      title: `Achievement Unlocked: ${achievement} 🏆`,
      message: description,
      type: "achievement",
      data: { achievement },
      actionUrl: "/dashboard?tab=achievements",
    })
  }

  static async notifyMedicineRecall(medicineNames: string[], reason: string): Promise<void> {
    await dbConnect()

    // Find all users who have donated these medicines
    const donations = await mongoose.model("Donation").find({
      "medicines.name": { $in: medicineNames },
      status: { $in: ["verified", "collected"] },
    })

    const userIds = [...new Set(donations.map((d) => d.userId?.toString()).filter(Boolean))]

    const notifications = userIds.map((userId) => ({
      userId,
      title: "Medicine Recall Alert ⚠️",
      message: `Important: Some medicines you donated have been recalled. Reason: ${reason}`,
      type: "recall" as const,
      data: { medicineNames, reason },
      actionUrl: "/dashboard?tab=donations",
    }))

    await this.createBulkNotifications(notifications)
  }
}
