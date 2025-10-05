import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export const dynamic = "force-dynamic"
export const revalidate = 0

const formatINR = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const verified = searchParams.get("verified")

    const query: any = {}
    if (category) query.category = category
    if (verified === "true") query.verified = true

    const products = await Product.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      products: products.map((p) => ({
        ...p,
        _id: p._id.toString(),
        price: p.price,
        priceInr: formatINR(p.price),
      })),
    })
  } catch (error: any) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, description, price, inStock, category, imageUrl, verified } = body

    if (!name || !description || price === undefined || inStock === undefined || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (price < 1 || price > 500) {
      return NextResponse.json({ success: false, error: "Price must be between ₹1 and ₹500" }, { status: 400 })
    }

    const product = await Product.create({
      name,
      description,
      price,
      inStock,
      category,
      imageUrl: imageUrl || undefined,
      verified: verified || false,
    })

    return NextResponse.json({
      success: true,
      product: {
        ...product.toObject(),
        _id: product._id.toString(),
        priceInr: formatINR(product.price),
      },
      message: "Product created successfully",
    })
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status: 500 })
  }
}
