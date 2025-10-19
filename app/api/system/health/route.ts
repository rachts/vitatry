import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/dbConnect"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const startTime = Date.now()
    await dbConnect()
    const dbConnectionTime = Date.now() - startTime

    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        {
          success: false,
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Database connection not initialized",
        },
        { status: 503 },
      )
    }

    let collections: string[] = []
    try {
      const list = await db.listCollections().toArray()
      collections = list.map((c) => c.name)
    } catch (e) {
      console.error("Error listing collections:", e)
      collections = []
    }

    async function safeStats(name: string) {
      try {
        const stats = await db.command({ collStats: name })
        return {
          name,
          count: stats?.count ?? 0,
          size: stats?.size ?? 0,
          avgObjSize: stats?.avgObjSize ?? 0,
        }
      } catch (e) {
        console.error(`Error getting stats for ${name}:`, e)
        return { name, count: 0, size: 0, avgObjSize: 0 }
      }
    }

    const topCollections = ["users", "orders", "donations", "products", "carts"].filter((n) => collections.includes(n))
    const stats = await Promise.all(topCollections.map((n) => safeStats(n)))

    const totalSize = stats.reduce((sum, s) => sum + (s.size || 0), 0)
    const totalDocuments = stats.reduce((sum, s) => sum + (s.count || 0), 0)

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      performance: {
        dbConnectionMs: dbConnectionTime,
      },
      mongo: {
        connected: true,
        collections,
        stats,
        summary: {
          totalCollections: collections.length,
          totalDocuments,
          totalSizeBytes: totalSize,
          totalSizeMb: Math.round((totalSize / 1024 / 1024) * 100) / 100,
        },
      },
    })
  } catch (error: any) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 503 },
    )
  }
}
