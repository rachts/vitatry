import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const response = NextResponse.next()

    // CORS for API routes
    const isApi = req.nextUrl.pathname.startsWith("/api")
    const origin = req.headers.get("origin") || ""
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000")
      .split(",")
      .map((s) => s.trim())
    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "*"

    if (isApi) {
      response.headers.set("Access-Control-Allow-Origin", allowOrigin)
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-Session-ID",
      )
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Vary", "Origin")
    }

    // Preflight for API
    if (isApi && req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }

    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "on")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    // HSTS for production
    if (process.env.NODE_ENV === "production") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Admin routes require admin role
        if (path.startsWith("/admin")) {
          return token?.role === "admin"
        }

        // Protected routes require authentication
        if (path.startsWith("/dashboard") || path.startsWith("/profile") || path.startsWith("/settings")) {
          return !!token
        }

        // All other routes are public
        return true
      },
    },
  },
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images|public).*)"],
}
