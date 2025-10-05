export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const query: any = { verified: true, inStock: { $gt: 0 } }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(50)

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    })

    const productsWithINR = products.map((p) => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      priceInr: formatter.format(p.price),
      inStock: p.inStock,
      category: p.category,
      imageUrl: p.imageUrl,
      verified: p.verified,
    }))

    return NextResponse.json({
      success: true,
      products: productsWithINR,
      total: products.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
