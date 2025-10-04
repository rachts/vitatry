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
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray()

        if (collections && collections.length > 0) {
          const firstCollection = collections[0].name
          dbStats = await mongoose.connection.db.command({ collStats: firstCollection })
        }
      }
    } catch (statsError) {
      console.error("Error getting DB stats:", statsError)
      dbStats = { error: "Unable to fetch collection stats" }
    }

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
        host: mongoose.connection.host || "unknown",
        stats: dbStats,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
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
