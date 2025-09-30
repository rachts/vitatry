import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createDatabaseIndexes } from "@/lib/database/collections"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize database indexes
    await createDatabaseIndexes()

    return NextResponse.json({
      message: "System initialized successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("System initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize system",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
