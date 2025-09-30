/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"
import { checkRateLimit } from "@/lib/rate-limit"
import dbConnect from "@/lib/dbConnect"
import VolunteerApplication from "@/models/VolunteerApplication"
import { requireAdmin } from "@/lib/guards"

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  const admin = await requireAdmin()
  if (!admin) return withCors(req, api.forbidden("Admin only"))
  try {
    await dbConnect()
    const items = await VolunteerApplication.find().sort({ createdAt: -1 }).lean()
    return withCors(req, api.ok(items))
  } catch {
    return withCors(req, api.error("Failed to fetch volunteers"))
  }
}
