import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError, ApiError } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

// Get the ApiKey model
const ApiKey = mongoose.models.ApiKey

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "API key ID is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the API key
    const apiKey = await ApiKey.findById(id)
    if (!apiKey) {
      throw new ApiError("API key not found", 404)
    }

    // Ensure the API key belongs to the user
    if (apiKey.userId.toString() !== session.user.id) {
      throw new ApiError("Unauthorized", 403)
    }

    // Delete the API key
    await ApiKey.findByIdAndDelete(id)

    return NextResponse.json({ message: "API key deleted successfully" })
  } catch (error) {
    return handleApiError(error)
  }
}
