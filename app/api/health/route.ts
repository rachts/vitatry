import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"

export async function GET() {
  try {
    // Check database connection
    await dbConnect()

    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        api: "operational",
      },
      version: process.env.npm_package_version || "1.0.0",
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}
