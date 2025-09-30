import { NextResponse } from "next/server"
import { checkDatabaseHealth, getDatabaseStats } from "@/lib/database/collections"

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()
    const dbStats = await getDatabaseStats()

    const health = {
      status: dbHealth.status === "healthy" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mongoUri: process.env.MONGODB_URI ? "configured" : "missing",
          nextAuthSecret: process.env.NEXTAUTH_SECRET ? "configured" : "missing",
          blobToken: process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "missing",
        },
      },
      statistics: dbStats,
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 },
    )
  }
}
