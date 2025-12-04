/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Production build settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
      { protocol: "https", hostname: "vitamend.com" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "*.vercel-storage.com" },
      { protocol: "https", hostname: "vercel-storage.com" },
      { protocol: "https", hostname: "blob.vercel-storage.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Standalone output for proper serverless bundling
  output: "standalone",

  // External packages for Node.js runtime
  serverExternalPackages: ["mongoose", "bcryptjs"],

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signup",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
