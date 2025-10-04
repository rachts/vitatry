export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"

export async function GET() {
  try {
    await dbConnect()

    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    let dbStats = null
    try {
      const collections = await mongoose.connection.db?.listCollections().toArray()
      const collectionNames = collections?.map((c) => c.name) || []

      if (collectionNames.length > 0) {
        dbStats = await mongoose.connection.db?.command({ collStats: collectionNames[0] })
      }
    } catch (statsError) {
      console.error("Error getting DB stats:", statsError)
    }

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        collections: dbStats ? 1 : 0,
      },
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
