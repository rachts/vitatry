/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "localhost",
      "vitamend.com",
      "vercel.app",
      "vercel-storage.com",
      "blob.vercel-storage.com",
      "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    ],
    unoptimized: true,
  },
  // CRITICAL: Force standalone output for proper API bundling
  output: "standalone",

  // CRITICAL: Tell Next.js mongoose is an external package for Node.js
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },

  compress: true,
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ]
  },
}

export default nextConfig
