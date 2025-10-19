import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Donation from "@/models/Donation"
import Product from "@/models/Product"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import VolunteerApplication from "@/models/VolunteerApplication"

export async function createDatabaseIndexes() {
  try {
    await dbConnect()

    // Ensure indexes exist
    await User.collection.createIndex({ email: 1 }, { unique: true })
    await User.collection.createIndex({ role: 1 })

    await Donation.collection.createIndex({ donationId: 1 }, { unique: true })
    await Donation.collection.createIndex({ status: 1 })
    await Donation.collection.createIndex({ donorEmail: 1 })
    await Donation.collection.createIndex({ category: 1 })
    await Donation.collection.createIndex({ createdAt: -1 })

    await Product.collection.createIndex({ category: 1 })
    await Product.collection.createIndex({ verified: 1 })
    await Product.collection.createIndex({ inStock: 1 })

    await Order.collection.createIndex({ userId: 1 })
    await Order.collection.createIndex({ createdAt: -1 })
    await Order.collection.createIndex({ orderStatus: 1 })

    await Cart.collection.createIndex({ userId: 1 }, { sparse: true })
    await Cart.collection.createIndex({ sessionId: 1 }, { sparse: true })

    await VolunteerApplication.collection.createIndex({ email: 1 })
    await VolunteerApplication.collection.createIndex({ status: 1 })

    console.log("Database indexes created successfully")
  } catch (error: any) {
    console.error("Error creating database indexes:", error)
    throw error
  }
}
