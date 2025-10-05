import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const isConnected = mongoose.connection.readyState === 1

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          status: "unhealthy",
          error: "Database not connected",
        },
        { status: 503 },
      )
    }

    let dbStats = null
    try {
      const db = mongoose.connection.db
      if (db) {
        const collectionsInfo = await db.listCollections().toArray()
        dbStats = {
          collections: collectionsInfo.length,
          collectionNames: collectionsInfo.map((c) => c.name),
        }
      }
    } catch (statsError: any) {
      console.warn("Could not fetch detailed DB stats:", statsError.message)
    }

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        stats: dbStats,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    })
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
