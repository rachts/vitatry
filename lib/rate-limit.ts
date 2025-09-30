/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import { type NextRequest, NextResponse } from "next/server"

type Bucket = { tokens: number; updatedAt: number }
const buckets = new Map<string, Bucket>()

function keyFromReq(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for") || ""
  const ip = xf.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon"
  return ip
}

export function checkRateLimit(req: NextRequest, maxRequests = 60, windowMs = 60000) {
  const key = keyFromReq(req)
  const now = Date.now()
  const capacity = maxRequests
  const refillPerMs = capacity / windowMs

  let b = buckets.get(key)
  if (!b) {
    b = { tokens: capacity, updatedAt: now }
    buckets.set(key, b)
  }

  const elapsed = now - b.updatedAt
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerMs)
  b.updatedAt = now

  if (b.tokens < 1) {
    return { allowed: false }
  }

  b.tokens -= 1
  return { allowed: true }
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    const result = checkRateLimit(req, config.maxRequests, config.windowMs)
    if (!result.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
    }
    return null
  }
}
