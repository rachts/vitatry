export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"

export async function GET() {
  // Minimal-safe response to avoid auth dependencies during build
  return NextResponse.json({ success: true, authenticated: false })
}
