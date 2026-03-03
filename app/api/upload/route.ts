import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const singleFile = formData.get("file") as File | null

    const filesToUpload = files.length > 0 ? files : singleFile ? [singleFile] : []

    if (filesToUpload.length === 0) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: `File ${file.name} too large (max 10MB)` }, { status: 400 })
      }

      const blob = await put(`donations/${Date.now()}-${file.name}`, file, {
        access: "public",
      })
      uploadedUrls.push(blob.url)
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
      name: filesToUpload[0]?.name,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload file"
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
