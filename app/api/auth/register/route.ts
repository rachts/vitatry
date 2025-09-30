/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import { z } from "zod"
import bcrypt from "bcryptjs"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
  } catch {
    return withCors(req, api.error("Database connection failed"))
  }
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid register payload"))
    const exists = await User.findOne({ email: parsed.data.email }).lean()
    if (exists) return withCors(req, api.error("User already exists", 409))
    const hash = await bcrypt.hash(parsed.data.password, 10)
    const user = await User.create({ name: parsed.data.name, email: parsed.data.email, password: hash, role: "user" })
    return withCors(req, api.created({ id: user._id, email: user.email }))
  } catch {
    return withCors(req, api.error("Failed to register"))
  }
}
