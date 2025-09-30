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

const loginSchema = z.object({
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
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) return withCors(req, api.badRequest("Invalid login payload"))
    const user = await User.findOne({ email: parsed.data.email })
    if (!user) return withCors(req, api.error("Invalid credentials", 401))
    const ok = await bcrypt.compare(parsed.data.password, (user as any).password || "")
    if (!ok) return withCors(req, api.error("Invalid credentials", 401))
    return withCors(req, api.ok({ id: user._id, email: user.email, name: user.name }))
  } catch {
    return withCors(req, api.error("Failed to login"))
  }
}
