import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

export interface Volunteer {
  _id?: ObjectId
  name: string
  email: string
  phone: string
  address?: string
  city: string
  availability: string
  skills: string[]
  experience?: string
  motivation?: string
  status: "pending" | "approved" | "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export async function submitVolunteerApplication(data: Omit<Volunteer, "_id" | "status" | "createdAt" | "updatedAt">) {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")

  const volunteer: Omit<Volunteer, "_id"> = {
    ...data,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await collection.insertOne(volunteer as Volunteer)
  return { id: result.insertedId.toString(), ...volunteer }
}

export async function getVolunteers(limit = 50) {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")
  return collection.find().sort({ createdAt: -1 }).limit(limit).toArray()
}

export async function getVolunteerCount() {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")
  return collection.countDocuments()
}

export async function getActiveVolunteers() {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")
  return collection.find({ status: { $in: ["approved", "active"] } }).toArray()
}

export async function updateVolunteerStatus(id: string, status: Volunteer["status"]) {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  )
}

export async function ensureIndexes() {
  const db = await getDb()
  const collection = db.collection<Volunteer>("volunteers")
  await collection.createIndex({ status: 1 })
  await collection.createIndex({ createdAt: -1 })
  await collection.createIndex({ email: 1 }, { unique: true })
}
