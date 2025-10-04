export const dynamic = "force-dynamic"
export const revalidate = 0

import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const verified = searchParams.get("verified")
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "12", 10)

    await dbConnect()

    const query: any = {}
    if (category) {
      query.category = category
    }
    if (verified === "true") {
      query.verified = true
    }

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const productsWithFormattedPrice = products.map((product) => ({
      ...product.toObject(),
      priceInr: new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(product.price),
    }))

    return NextResponse.json({
      success: true,
      products: productsWithFormattedPrice,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, description, price, inStock, category, imageUrl, verified } = body

    if (!name || !description || !price || !category) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    if (price < 1 || price > 500) {
      return NextResponse.json({ success: false, error: "Price must be between ₹1 and ₹500" }, { status: 400 })
    }

    const product = await Product.create({
      name,
      description,
      price,
      inStock: inStock || 0,
      category,
      imageUrl,
      verified: verified || false,
    })

    const productWithFormattedPrice = {
      ...product.toObject(),
      priceInr: new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(product.price),
    }

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product: productWithFormattedPrice,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
