import { type NextRequest, NextResponse } from "next/server"
import { OCRService } from "@/lib/ai/ocr-service"

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const result = await OCRService.extractText(imageUrl)

    return NextResponse.json({
      text: result.text,
      confidence: result.confidence,
      words: result.words,
    })
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json({ error: "Failed to extract text from image" }, { status: 500 })
  }
}
