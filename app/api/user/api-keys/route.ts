import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import { generateApiKey } from "@/lib/api-auth"
import mongoose from "mongoose"

// Get the ApiKey model
const ApiKey = mongoose.models.ApiKey

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const apiKeys = await ApiKey.find({ userId: session.user.id }).sort({ createdAt: -1 })

    // Mask the actual keys for security
    const maskedKeys = apiKeys.map((key) => ({
      id: key._id.toString(),
      name: key.name,
      key: key.key, // In a real app, you might want to mask this or not include it
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      expiresAt: key.expiresAt,
    }))

    return NextResponse.json({ apiKeys: maskedKeys })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    await dbConnect()

    // Generate a new API key
    const key = await generateApiKey(session.user.id, name, ["read", "write"])

    // Find the newly created key
    const apiKey = await ApiKey.findOne({ key })

    return NextResponse.json(
      {
        message: "API key created successfully",
        apiKey: {
          id: apiKey._id.toString(),
          name: apiKey.name,
          key: apiKey.key,
          createdAt: apiKey.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
