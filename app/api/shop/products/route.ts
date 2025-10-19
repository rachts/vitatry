import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)

    const query: Record<string, any> = { verified: true }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$text = { $search: search }
    }

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

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()
    const { name, description, category, price, inStock, image, manufacturer, expiryDate, dosage, donationId } = body

    // Validate required fields
    if (!name || !category || price === undefined || inStock === undefined || !manufacturer || !expiryDate) {
      return NextResponse.json({ success: false, error: "Missing required product fields" }, { status: 400 })
    }

    // Validate numeric fields
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ success: false, error: "Price must be a non-negative number" }, { status: 400 })
    }

    if (typeof inStock !== "number" || inStock < 0) {
      return NextResponse.json({ success: false, error: "Stock must be a non-negative number" }, { status: 400 })
    }

    // Validate expiry date
    const expiryDateObj = new Date(expiryDate)
    if (isNaN(expiryDateObj.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid expiry date" }, { status: 400 })
    }

    if (expiryDateObj <= new Date()) {
      return NextResponse.json({ success: false, error: "Product has already expired" }, { status: 400 })
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim(),
      category: category.trim(),
      price,
      inStock,
      image,
      manufacturer: manufacturer.trim(),
      expiryDate: expiryDateObj,
      dosage: dosage?.trim(),
      verified: true,
      donationId,
    })

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product.toObject(),
          _id: product._id?.toString(),
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status: 500 })
  }
}
