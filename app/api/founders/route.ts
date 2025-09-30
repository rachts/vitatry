/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import type { NextRequest } from "next/server"
import { api } from "@/lib/api-response"
import { withCors, preflight } from "@/lib/cors"

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function GET(req: NextRequest) {
  const founders = [
    {
      name: "Rachit Kumar Tiwari",
      role: "Founder & CEO",
      photo: "/images/rachit.png",
      bio: "Leads strategy and partnerships.",
    },
    { name: "Nandini Dubey", role: "CTO", photo: "/images/f2.png", bio: "Builds core platform and AI systems." },
    { name: "Priya Pandey", role: "COO", photo: "/images/f3.png", bio: "Operations and NGO relations." },
    { name: "Pranav Dadhich", role: "Head of Product", photo: "/images/f4.png", bio: "Product and user experience." },
  ]
  return withCors(req, api.ok(founders))
}
