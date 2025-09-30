import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    const response = NextResponse.next()

    // CORS for API routes
    const isApi = req.nextUrl.pathname.startsWith("/api")
    const origin = req.headers.get("origin") || ""
    const allowed = (process.env.ALLOWED_ORIGINS || process.env.NEXTAUTH_URL || "http://localhost:3000")
      .split(",")
      .map((s) => s.trim())
    const allowOrigin = allowed.includes(origin) ? origin : allowed[0] || "*"

    if (isApi) {
      response.headers.set("Access-Control-Allow-Origin", allowOrigin)
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
      response.headers.set("Access-Control-Allow-Credentials", "true")
      response.headers.set("Vary", "Origin")
    }

    // Preflight for API
    if (isApi && req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: response.headers })
    }

    // Security Headers
    response.headers.set("X-DNS-Prefetch-Control", "off")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.vercel.com https://*.vercel.app",
      "frame-src 'self' https://vercel.live",
    ].join("; ")

    response.headers.set("Content-Security-Policy", csp)

    // HSTS
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin"
        }
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        return true
      },
    },
  },
)

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
}
