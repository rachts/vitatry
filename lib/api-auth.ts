import type { NextRequest } from "next/server"
import dbConnect from "@/lib/dbConnect"
import { ApiError } from "@/lib/api-error"

// Define a model for API keys
import mongoose, { type Document, type Model } from "mongoose"

export interface IApiKey extends Document {
  key: string
  userId: mongoose.Types.ObjectId
  name: string
  permissions: string[]
  lastUsed?: Date
  createdAt: Date
  expiresAt?: Date
}

const ApiKeySchema = new mongoose.Schema<IApiKey>(
  {
    key: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    permissions: [String],
    lastUsed: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  },
)

const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema)

export async function verifyApiKey(req: NextRequest): Promise<{ userId: string; permissions: string[] } | null> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const apiKey = authHeader.substring(7) // Remove "Bearer " prefix

  if (!apiKey) {
    return null
  }

  await dbConnect()

  const keyDoc = await ApiKey.findOne({ key: apiKey })

  if (!keyDoc) {
    return null
  }

  // Check if key is expired
  if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
    throw new ApiError("API key has expired", 401)
  }

  // Update last used timestamp
  keyDoc.lastUsed = new Date()
  await keyDoc.save()

  return {
    userId: keyDoc.userId.toString(),
    permissions: keyDoc.permissions,
  }
}

export async function generateApiKey(userId: string, name: string, permissions: string[] = []): Promise<string> {
  // Generate a secure random API key
  const key = Buffer.from(crypto.randomUUID() + crypto.randomUUID()).toString("base64")

  await dbConnect()

  await ApiKey.create({
    key,
    userId,
    name,
    permissions,
  })

  return key
}
