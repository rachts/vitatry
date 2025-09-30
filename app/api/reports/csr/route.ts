import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import { ReportGenerator } from "@/lib/report-generator"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to access CSR reports
    if (!["admin", "ngo_partner"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get("organizationId") || undefined
    const format = searchParams.get("format") || "json"

    const report = await ReportGenerator.generateCSRReport(organizationId)

    if (format === "pdf") {
      // Generate PDF (you'd implement PDF generation here)
      return new NextResponse("PDF generation not implemented yet", { status: 501 })
    } else if (format === "excel") {
      // Generate Excel (you'd implement Excel generation here)
      return new NextResponse("Excel generation not implemented yet", { status: 501 })
    }

    return NextResponse.json(report)
  } catch (error) {
    return handleApiError(error)
  }
}
