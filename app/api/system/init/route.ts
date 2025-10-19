import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createDatabaseIndexes } from "@/lib/database/collections"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await createDatabaseIndexes()

    return NextResponse.json({
      success: true,
      initialized: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("System initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize system",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
