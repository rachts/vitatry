import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://vitamend.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/profile/", "/settings/", "/auth/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
