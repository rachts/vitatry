import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export async function createDatabaseIndexes() {
  await dbConnect()

  try {
    const User = mongoose.models.User
    if (User) {
      await User.collection.createIndex({ role: 1 })
      await User.collection.createIndex({ createdAt: -1 })
    }

    const Donation = mongoose.models.Donation
    if (Donation) {
      await Donation.collection.createIndex({ userId: 1, status: 1 })
      await Donation.collection.createIndex({ status: 1, createdAt: -1 })
      await Donation.collection.createIndex({ createdAt: -1 })
      await Donation.collection.createIndex({ expiryDate: 1 })
    }

    const VolunteerApplication = mongoose.models.VolunteerApplication
    if (VolunteerApplication) {
      await VolunteerApplication.collection.createIndex({ email: 1 })
      await VolunteerApplication.collection.createIndex({ city: 1 })
      await VolunteerApplication.collection.createIndex({ createdAt: -1 })
    }

    const Notification = mongoose.models.Notification
    if (Notification) {
      await Notification.collection.createIndex({ userId: 1, read: 1 })
      await Notification.collection.createIndex({ userId: 1, createdAt: -1 })
      await Notification.collection.createIndex({ type: 1 })
      await Notification.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    }

    const MedicineRequest = mongoose.models.MedicineRequest
    if (MedicineRequest) {
      await MedicineRequest.collection.createIndex({ ngoId: 1, status: 1 })
      await MedicineRequest.collection.createIndex({ urgency: 1, createdAt: -1 })
    }

    const AuditLog = mongoose.models.AuditLog
    if (AuditLog) {
      await AuditLog.collection.createIndex({ userId: 1, createdAt: -1 })
      await AuditLog.collection.createIndex({ action: 1, createdAt: -1 })
      await AuditLog.collection.createIndex({ resourceType: 1, resourceId: 1 })
    }

    console.log("Database indexes created successfully")
  } catch (error) {
    console.error("Error creating database indexes:", error)
    throw error
  }
}

export async function checkDatabaseHealth() {
  try {
    await dbConnect()
    const admin = mongoose.connection.db?.admin()
    if (!admin) {
      return { status: "unhealthy", error: "Database admin not available" }
    }
    const result = await admin.ping()
    return { status: "healthy", ping: result }
  } catch (error) {
    return { status: "unhealthy", error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getDatabaseStats() {
  try {
    await dbConnect()
    const db = mongoose.connection.db

    if (!db) {
      return null
    }

    const collections = await db.listCollections().toArray()
    const stats: Record<string, any> = {}

    for (const collection of collections) {
      try {
        const collectionStats = await db.command({ collStats: collection.name })
        stats[collection.name] = {
          documents: collectionStats.count || 0,
          size: collectionStats.size || 0,
          avgObjSize: collectionStats.avgObjSize || 0,
          indexes: collectionStats.nindexes || 0,
        }
      } catch (error) {
        console.error(`Error getting stats for ${collection.name}:`, error)
        stats[collection.name] = { error: "Unable to fetch stats" }
      }
    }

    return stats
  } catch (error) {
    console.error("Error getting database stats:", error)
    return null
  }
}
