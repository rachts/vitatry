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
import { requireUser } from "@/lib/guards"

const donationSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  image: z.string().url(),
  expiryDate: z.coerce.date(),
  manufacturer: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(10).max(200),
  inStock: z.coerce.number().int().min(0).default(0),
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
    const now = new Date()
    const items = await Product.find({
      verified: true,
      inStock: { $gt: 0 },
      expiryDate: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .lean()
    const data = items.map((p: any) => ({ ...p, priceInr: priceInr(p.price) }))
    return withCors(req, api.ok(data))
  } catch {
    return withCors(req, api.error("Failed to fetch medicines"))
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
    const user = await requireUser()
    const json = await req.json()
    const parsed = donationSchema.safeParse(json)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid donation payload"))
    if (parsed.data.expiryDate <= new Date()) return withCors(req, api.badRequest("Expiry date must be in the future"))
    const created = await Product.create({
      ...parsed.data,
      verified: false,
      donatedBy: user?.user?.id,
      inStock: parsed.data.inStock ?? 0,
    })
    const data = { ...created.toObject(), priceInr: priceInr(created.price) }
    return withCors(req, api.created(data))
  } catch {
    return withCors(req, api.error("Failed to submit donation"))
  }
}
