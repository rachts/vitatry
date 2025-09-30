import { type NextRequest, NextResponse } from "next/server"
import { MedicineVerificationService } from "@/lib/ai/medicine-verification"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const result = await MedicineVerificationService.verifyMedicine(imageUrl)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Medicine verification API error:", error)
    return NextResponse.json({ error: "Failed to verify medicine" }, { status: 500 })
  }
}
