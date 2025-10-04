export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ReportGenerator } from "@/lib/report-generator"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!["admin", "ngo_partner"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get("organizationId") || undefined
    const format = searchParams.get("format") || "json"

    const report = await ReportGenerator.generateCSRReport(organizationId)

    if (format === "pdf" || format === "excel") {
      return new NextResponse(`${format.toUpperCase()} generation not implemented yet`, { status: 501 })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error generating CSR report:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
