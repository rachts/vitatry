import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { verifyMedicine } from "@/lib/ai/medicine-verification"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !["admin", "reviewer"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { medicines } = body

    if (!medicines || !Array.isArray(medicines)) {
      return NextResponse.json({ error: "Invalid medicines data" }, { status: 400 })
    }

    const results = []

    for (const medicine of medicines) {
      try {
        const verification = await verifyMedicine({
          imageUrl: medicine.imageUrl,
          medicineName: medicine.name,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate,
        })

        results.push({
          id: medicine.id,
          name: medicine.name,
          verification,
        })
      } catch (error) {
        results.push({
          id: medicine.id,
          name: medicine.name,
          verification: {
            isValid: false,
            confidence: 0,
            issues: ["Verification failed"],
            recommendation: "manual_review",
          },
        })
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        valid: results.filter((r) => r.verification.isValid).length,
        invalid: results.filter((r) => !r.verification.isValid).length,
        needsReview: results.filter((r) => r.verification.recommendation === "manual_review").length,
      },
    })
  } catch (error) {
    console.error("Error in batch verification:", error)
    return NextResponse.json({ error: "Batch verification failed" }, { status: 500 })
  }
}
