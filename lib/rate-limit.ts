/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"

type Bucket = { tokens: number; updatedAt: number }
const buckets = new Map<string, Bucket>()
const CAPACITY = Number(process.env.RATE_LIMIT_CAPACITY || 60)
const REFILL_PER_SEC = Number(process.env.RATE_LIMIT_REFILL || 1)

function keyFromReq(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || ""
  const ip = xf.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon"
  return ip
}

export function checkRateLimit(req: NextRequest) {
  const key = keyFromReq(req)
  const now = Date.now() / 1000
  let b = buckets.get(key)
  if (!b) {
    b = { tokens: CAPACITY, updatedAt: now }
    buckets.set(key, b)
  }
  const elapsed = now - b.updatedAt
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC)
  b.updatedAt = now
  if (b.tokens < 1) return { allowed: false }
  b.tokens -= 1
  return { allowed: true }
}
