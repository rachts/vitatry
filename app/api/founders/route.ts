import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const founders = [
    {
      name: "Rachit Kumar Tiwari",
      role: "Founder & Developer",
      photo: "/images/img-20250508-025607.jpg",
      bio: "Building VitaMend to make healthcare accessible.",
      linkedin: "https://www.linkedin.com/in/rachitkrtiwari/",
    },
  ]
  return NextResponse.json({ success: true, data: founders })
}
