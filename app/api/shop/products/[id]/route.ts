import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

const formatINR = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product._id?.toString(),
        priceInr: formatINR(product.price),
      },
    })
  } catch (error: any) {
    console.error("Product GET error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = params
    const updates = await req.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const product = await Product.findByIdAndUpdate(id, updates, { new: true }).lean()

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        _id: product._id?.toString(),
        priceInr: formatINR(product.price),
      },
    })
  } catch (error: any) {
    console.error("Product PATCH error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    await Product.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error: any) {
    console.error("Product DELETE error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to delete product" }, { status: 500 })
  }
}
