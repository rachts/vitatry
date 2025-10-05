import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import mongoose from "mongoose"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // ✅ Attempt DB connection
    await dbConnect()

    const isConnected = mongoose.connection.readyState === 1

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          status: "unhealthy",
          error: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // ✅ Try fetching database stats safely
    let dbStats: {
      collections: number
      collectionNames: string[]
    } | null = null

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
      console.warn("⚠️ Could not fetch detailed DB stats:", statsError.message)
    }

    // ✅ Return comprehensive system health info
    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || "N/A",
        name: mongoose.connection.name || "N/A",
        stats: dbStats,
      },
      system: {
        uptimeSeconds: process.uptime(),
        memoryUsageMB: {
          rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
          heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
          heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
          external: (process.memoryUsage().external / 1024 / 1024).toFixed(2),
        },
      },
    })
  } catch (error: any) {
    console.error("❌ Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error.message || "Health check error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
