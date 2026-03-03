import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

export interface Donation {
  _id?: ObjectId
  donorName: string
  donorEmail: string
  donorPhone?: string
  medicineName: string
  medicineType: string
  quantity: number
  expiryDate: string
  batchNumber?: string
  manufacturer?: string
  notes?: string
  imageUrls: string[]
  status: "pending" | "approved" | "rejected" | "distributed"
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export async function submitDonation(data: Omit<Donation, "_id" | "status" | "verified" | "createdAt" | "updatedAt">) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")

  const donation: Omit<Donation, "_id"> = {
    ...data,
    status: "pending",
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await collection.insertOne(donation as Donation)
  return { id: result.insertedId.toString(), ...donation }
}

export async function getDonations(limit = 50) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection.find().sort({ createdAt: -1 }).limit(limit).toArray()
}

export async function getUserDonations(email: string) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection.find({ donorEmail: email }).sort({ createdAt: -1 }).toArray()
}

export async function getActiveDonations(limit = 20) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection
    .find({ status: { $in: ["pending", "approved"] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function updateDonationStatus(id: string, status: Donation["status"]) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  )
}

export async function getDonationCount() {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection.countDocuments()
}

export async function getRecentDonations(limit = 5) {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  return collection.find().sort({ createdAt: -1 }).limit(limit).toArray()
}

export async function ensureIndexes() {
  const db = await getDb()
  const collection = db.collection<Donation>("donations")
  await collection.createIndex({ status: 1 })
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex({ donorEmail: 1 })
}
