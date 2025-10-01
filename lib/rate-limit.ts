/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(req: Request, capacity = 100, refillRate = 10): RateLimitResult {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const now = Date.now()
  const key = `rate-limit:${ip}`

  let bucket = store.get(key)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: capacity, resetAt: now + 60000 }
    store.set(key, bucket)
  }

  const timePassed = now - (bucket.resetAt - 60000)
  const tokensToAdd = Math.floor(timePassed / 1000) * refillRate
  bucket.count = Math.min(capacity, bucket.count + tokensToAdd)

  if (bucket.count > 0) {
    bucket.count--
    store.set(key, bucket)
    return { allowed: true, remaining: bucket.count, reset: bucket.resetAt }
  }

  return { allowed: false, remaining: 0, reset: bucket.resetAt }
}

export function rateLimit(capacity = 100, refillRate = 10) {
  return (req: Request) => checkRateLimit(req, capacity, refillRate)
}
