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
import { z } from "zod"

export const dynamic = "force-dynamic"

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(10).max(200),
  inStock: z.number().min(0),
  category: z.string().min(1),
  imageUrl: z.string().optional(),
  expiryDate: z.string().optional(),
})

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const rl = checkRateLimit(req)
  if (!rl.allowed) return withCors(req, api.badRequest("Too many requests"))

  try {
    await dbConnect()
    const today = new Date()
    const products = await Product.find({
      verified: true,
      inStock: { $gt: 0 },
      $or: [{ expiryDate: { $exists: false } }, { expiryDate: { $gt: today } }],
    })
      .sort({ createdAt: -1 })
      .lean()

    const formatted = products.map((p) => ({
      ...p,
      priceInr: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p.price),
    }))

    return withCors(req, api.ok(formatted))
  } catch {
    return withCors(req, api.error("Failed to fetch products"))
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
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid product data"))

    const product = await Product.create({
      ...parsed.data,
      verified: false,
    })

    return withCors(req, api.created(product))
  } catch {
    return withCors(req, api.error("Failed to create product"))
  }
}
