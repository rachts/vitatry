import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

export interface Medicine {
  _id?: ObjectId
  name: string
  type: string
  quantity: number
  expiryDate: string
  batchNumber?: string
  manufacturer?: string
  description?: string
  imageUrls: string[]
  verified: boolean
  status: "available" | "reserved" | "distributed"
  donorId?: string
  createdAt: Date
  updatedAt: Date
}

export async function getMedicines(limit = 50) {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")
  return collection
    .find({ status: "available" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

export async function getMedicineById(id: string) {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")
  return collection.findOne({ _id: new ObjectId(id) })
}

export async function addMedicine(data: Omit<Medicine, "_id" | "createdAt" | "updatedAt">) {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")

  const medicine: Omit<Medicine, "_id"> = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await collection.insertOne(medicine as Medicine)
  return { id: result.insertedId.toString(), ...medicine }
}

export async function getMedicineCount() {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")
  return collection.countDocuments({ status: "available" })
}

export async function updateMedicineStatus(id: string, status: Medicine["status"]) {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  )
}

export async function ensureIndexes() {
  const db = await getDb()
  const collection = db.collection<Medicine>("medicines")
  await collection.createIndex({ status: 1 })
  await collection.createIndex({ verified: 1 })
  await collection.createIndex({ createdAt: -1 })
}
