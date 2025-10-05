export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"

export async function GET() {
  try {
    await dbConnect()

    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    let collectionCount = 0
    try {
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray()
        collectionCount = collections.length
      }
    } catch (statsError) {
      console.error("Error getting collection count:", statsError)
    }

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
        host: mongoose.connection.host || "unknown",
        collections: collectionCount,
      },
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
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
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
