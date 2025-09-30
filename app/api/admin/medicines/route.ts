/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"
import { checkRateLimit } from "@/lib/rate-limit"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"
import { requireAdmin } from "@/lib/guards"
import { z } from "zod"
import mongoose from "mongoose"

const actionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["verify", "reject"]),
})

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
    const pending = await Product.find({ verified: false }).sort({ createdAt: -1 }).lean()
    return withCors(req, api.ok(pending))
  } catch {
    return withCors(req, api.error("Failed to fetch pending donations"))
  }
}

export async function PUT(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  const admin = await requireAdmin()
  if (!admin) return withCors(req, api.forbidden("Admin only"))
  try {
    await dbConnect()
  } catch {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const body = await req.json()
    const parsed = actionSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid payload"))
    const { id, action } = parsed.data
    if (!mongoose.Types.ObjectId.isValid(id)) return withCors(req, api.badRequest("Invalid ID"))
    if (action === "verify") {
      const updated = await Product.findByIdAndUpdate(
        id,
        { verified: true, verificationDate: new Date() },
        { new: true },
      ).lean()
      if (!updated) return withCors(req, api.notFound("Item not found"))
      return withCors(req, api.ok(updated))
    } else {
      const deleted = await Product.findByIdAndDelete(id).lean()
      if (!deleted) return withCors(req, api.notFound("Item not found"))
      return withCors(req, api.ok({ id, status: "rejected" }))
    }
  } catch {
    return withCors(req, api.error("Failed to moderate donation"))
  }
}
