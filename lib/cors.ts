/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import { NextResponse, type NextRequest } from "next/server"

function parseAllowedOrigins() {
  const env = process.env.ALLOWED_ORIGINS || "http://localhost:3000"
  return env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function resolveOrigin(req: NextRequest, allowed: string[]) {
  const origin = req.headers.get("origin") || ""
  if (allowed.includes("*")) return "*"
  if (allowed.includes(origin)) return origin
  return allowed[0] || "*"
}

export function withCors(req: NextRequest, res: NextResponse) {
  const allowed = parseAllowedOrigins()
  const origin = resolveOrigin(req, allowed)
  res.headers.set("Access-Control-Allow-Origin", origin)
  res.headers.set("Vary", "Origin")
  res.headers.set("Access-Control-Allow-Credentials", "true")
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
  return res
}

export function preflight(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 })
  return withCors(req, res)
}
