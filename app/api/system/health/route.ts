export const dynamic = "force-dynamic"

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
        await mongoose.connection.db.command({ ping: 1 })
        const collections = await mongoose.connection.db.listCollections().toArray()
        dbStats = {
          status: "healthy",
          collections: collections.length,
          database: mongoose.connection.db.databaseName,
        }
      }
    } catch (error) {
      console.error("Error getting database stats:", error)
      dbStats = {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        stats: dbStats,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
