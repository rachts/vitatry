/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"
import { checkRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"
import mongoose from "mongoose"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  image: z.string().url().optional(),
  expiryDate: z.coerce.date().optional(),
  inStock: z.coerce.number().int().nonnegative().optional(),
  manufacturer: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  price: z.coerce.number().min(10).max(200).optional(),
  verified: z.boolean().optional(),
})

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
  } catch {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const { id } = ctx.params
    if (!mongoose.Types.ObjectId.isValid(id)) return withCors(req, api.badRequest("Invalid ID"))
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid payload"))
    if (parsed.data.expiryDate && parsed.data.expiryDate <= new Date())
      return withCors(req, api.badRequest("Expiry date must be in the future"))
    const updated = await Product.findByIdAndUpdate(id, parsed.data, { new: true }).lean()
    if (!updated) return withCors(req, api.notFound("Product not found"))
    return withCors(req, api.ok(updated))
  } catch (e) {
    logger.error("PUT /api/shop/products/[id]", e)
    return withCors(req, api.error("Failed to update product"))
  }
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
  } catch {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const { id } = ctx.params
    if (!mongoose.Types.ObjectId.isValid(id)) return withCors(req, api.badRequest("Invalid ID"))
    const deleted = await Product.findByIdAndDelete(id).lean()
    if (!deleted) return withCors(req, api.notFound("Product not found"))
    return withCors(req, api.ok({ id }))
  } catch (e) {
    logger.error("DELETE /api/shop/products/[id]", e)
    return withCors(req, api.error("Failed to delete product"))
  }
}
