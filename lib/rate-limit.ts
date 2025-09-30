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

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function rateLimit(config: RateLimitConfig) {
  const CAPACITY = config.maxRequests
  const REFILL_PER_MS = CAPACITY / config.windowMs

  return async (req: NextRequest) => {
    const key = keyFromReq(req)
    const now = Date.now()
    let b = buckets.get(key)

    if (!b) {
      b = { tokens: CAPACITY, updatedAt: now }
      buckets.set(key, b)
    }

    const elapsed = now - b.updatedAt
    b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_MS)
    b.updatedAt = now

    if (b.tokens < 1) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 })
    }

    b.tokens -= 1
    return null
  }
}
