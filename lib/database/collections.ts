import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Create database indexes for better performance
export async function createDatabaseIndexes() {
  await dbConnect()

  try {
    // User indexes
    const User = mongoose.models.User
    if (User) {
      await User.collection.createIndex({ email: 1 }, { unique: true })
      await User.collection.createIndex({ role: 1 })
      await User.collection.createIndex({ "profile.verificationLevel": 1 })
      await User.collection.createIndex({ createdAt: -1 })
    }

    // Donation indexes
    const Donation = mongoose.models.Donation
    if (Donation) {
      await Donation.collection.createIndex({ userId: 1, status: 1 })
      await Donation.collection.createIndex({ status: 1, createdAt: -1 })
      await Donation.collection.createIndex({ "medicines.name": "text" })
      await Donation.collection.createIndex({ createdAt: -1 })
      await Donation.collection.createIndex({ expiryDate: 1 })
    }

    // Volunteer Application indexes
    const VolunteerApplication = mongoose.models.VolunteerApplication
    if (VolunteerApplication) {
      await VolunteerApplication.collection.createIndex({ email: 1 })
      await VolunteerApplication.collection.createIndex({ city: 1 })
      await VolunteerApplication.collection.createIndex({ createdAt: -1 })
    }

    // Notification indexes
    const Notification = mongoose.models.Notification
    if (Notification) {
      await Notification.collection.createIndex({ userId: 1, read: 1 })
      await Notification.collection.createIndex({ userId: 1, createdAt: -1 })
      await Notification.collection.createIndex({ type: 1 })
      await Notification.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    }

    // Medicine Request indexes
    const MedicineRequest = mongoose.models.MedicineRequest
    if (MedicineRequest) {
      await MedicineRequest.collection.createIndex({ ngoId: 1, status: 1 })
      await MedicineRequest.collection.createIndex({ "medicines.name": 1 })
      await MedicineRequest.collection.createIndex({ urgency: 1, createdAt: -1 })
    }

    // Audit Log indexes
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

// Database health check
export async function checkDatabaseHealth() {
  try {
    await dbConnect()
    const admin = mongoose.connection.db.admin()
    const result = await admin.ping()
    return { status: "healthy", ping: result }
  } catch (error) {
    return { status: "unhealthy", error: error.message }
  }
}

// Get database statistics
export async function getDatabaseStats() {
  try {
    await dbConnect()
    const db = mongoose.connection.db

    const collections = await db.listCollections().toArray()
    const stats = {}

    for (const collection of collections) {
      const collectionStats = await db.collection(collection.name).stats()
      stats[collection.name] = {
        documents: collectionStats.count,
        size: collectionStats.size,
        avgObjSize: collectionStats.avgObjSize,
        indexes: collectionStats.nindexes,
      }
    }

    return stats
  } catch (error) {
    console.error("Error getting database stats:", error)
    return null
  }
}
