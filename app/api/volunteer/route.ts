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
import { z } from "zod"

const volunteerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  role: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
})

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
    const items = await VolunteerApplication.find().sort({ createdAt: -1 }).limit(25).lean()
    return withCors(req, api.ok(items))
  } catch {
    return withCors(req, api.error("Failed to fetch volunteers"))
  }
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
  } catch {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const json = await req.json()
    const parsed = volunteerSchema.safeParse(json)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid volunteer payload"))
    const exists = await VolunteerApplication.findOne({ email: parsed.data.email }).lean()
    if (exists) return withCors(req, api.error("Volunteer with this email already exists", 409))
    const created = await VolunteerApplication.create(parsed.data)
    return withCors(req, api.created(created.toObject()))
  } catch {
    return withCors(req, api.error("Failed to add volunteer"))
  }
}
