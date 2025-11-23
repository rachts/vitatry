import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const verified = searchParams.get("verified") === "true"
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)
    const search = searchParams.get("search")

    const query: Record<string, any> = {}

    if (verified) {
      query.verified = true
    }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    query.inStock = { $gt: 0 }
    query.expiryDate = { $gt: new Date() }

    const skip = (page - 1) * limit
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        _id: p._id?.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}
