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

const medicineSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  expiryDate: z.string(),
  quantity: z.number().min(1),
  imageUrl: z.string().optional(),
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
    const medicines = await Product.find({
      verified: true,
      expiryDate: { $gt: today },
    })
      .sort({ createdAt: -1 })
      .lean()

    return withCors(req, api.ok(medicines))
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
    const body = await req.json()
    const parsed = medicineSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid medicine data"))

    const expiry = new Date(parsed.data.expiryDate)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    if (expiry < sixMonthsFromNow) {
      return withCors(req, api.badRequest("Medicine must have at least 6 months before expiry"))
    }

    const medicine = await Product.create({
      name: parsed.data.name,
      description: parsed.data.description,
      price: 0,
      inStock: parsed.data.quantity,
      category: "donation",
      imageUrl: parsed.data.imageUrl,
      expiryDate: expiry,
      verified: false,
    })

    return withCors(req, api.created({ id: medicine._id, status: "pending" }))
  } catch {
    return withCors(req, api.error("Failed to create medicine donation"))
  }
}
