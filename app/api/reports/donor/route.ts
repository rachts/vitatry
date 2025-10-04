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

    const { searchParams } = new URL(req.url)
    const fromDate = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
    const toDate = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined
    const format = searchParams.get("format") || "json"

    const report = await ReportGenerator.generateDonorReport(session.user.id, fromDate, toDate)

    if (format === "pdf") {
      return new NextResponse("PDF generation not implemented yet", { status: 501 })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error generating donor report:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
