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
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  image: z.string().url(),
  expiryDate: z.coerce.date(),
  inStock: z.coerce.number().int().nonnegative().default(0),
  manufacturer: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(10).max(200),
})

function priceInr(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
}

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
    const searchParams = req.nextUrl.searchParams
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "10")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "200")
    const now = new Date()
    const items = await Product.find({
      verified: true,
      inStock: { $gt: 0 },
      expiryDate: { $gt: now },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .sort({ createdAt: -1 })
      .lean()

    const data = items.map((p: any) => ({ ...p, priceInr: priceInr(p.price) }))
    return withCors(req, api.ok(data))
  } catch (e) {
    logger.error("GET /api/shop/products", e)
    return withCors(req, api.error("Failed to fetch products"))
  }
}

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))
  try {
    await dbConnect()
  } catch (e) {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const json = await req.json()
    const parsed = productSchema.safeParse(json)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid product payload"))
    if (parsed.data.expiryDate <= new Date()) return withCors(req, api.badRequest("Expiry date must be in the future"))
    const created = await Product.create({ ...parsed.data, verified: true })
    const data = { ...created.toObject(), priceInr: priceInr(created.price) }
    return withCors(req, api.created(data))
  } catch (e) {
    logger.error("POST /api/shop/products", e)
    return withCors(req, api.error("Failed to create product"))
  }
}
