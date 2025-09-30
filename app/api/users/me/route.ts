/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user) return withCors(req, api.unauthorized("Not authenticated"))
  return withCors(req, api.ok({ user: session.user }))
}
