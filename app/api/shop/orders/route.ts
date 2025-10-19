import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import mongoose from "mongoose"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1"), 1)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "10"), 100)

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const query: any = {}
    try {
      query.userId = session.user.id
    } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((o) => ({
          ...o,
          _id: o._id?.toString(),
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    await dbConnect()

    const userSession = await getServerSession(authOptions)
    const body = await request.json()
    const { shippingAddress, paymentMethod, promoCode, sessionId } = body

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Shipping address and payment method are required" },
        { status: 400 },
      )
    }

    if (!["credit_card", "debit_card", "upi", "netbanking"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 })
    }

    // Validate shipping address
    const { street, city, state, zipCode, country } = shippingAddress
    if (!street || !city || !state || !zipCode || !country) {
      return NextResponse.json({ success: false, error: "Complete shipping address is required" }, { status: 400 })
    }

    const cartQuery: any = {}

    if (userSession?.user?.id) {
      try {
        cartQuery.userId = new mongoose.Types.ObjectId(userSession.user.id)
      } catch (e) {
        return NextResponse.json({ success: false, error: "Invalid session" }, { status: 400 })
      }
    } else if (sessionId) {
      cartQuery.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
    }

    // Get cart
    const cart = await Cart.findOne(cartQuery).populate("items.productId").session(session)

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      await session.abortTransaction()
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 })
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      if (!item.productId) {
        await session.abortTransaction()
        return NextResponse.json({ success: false, error: "Invalid product in cart" }, { status: 400 })
      }

      const product = await Product.findById(item.productId._id).session(session)
      if (!product || product.inStock < item.quantity) {
        await session.abortTransaction()
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for ${(item.productId as any).name}`,
          },
          { status: 400 },
        )
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0)

    let discount = 0
    if (promoCode) {
      const code = promoCode.toUpperCase()
      if (code === "VITAMEND10") {
        discount = subtotal * 0.1
      } else if (code === "HEALTH20") {
        discount = subtotal * 0.2
      }
    }

    const shipping = subtotal > 50 ? 0 : 9.99
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100
    const total = subtotal - discount + shipping + tax

    // Create order
    const orderItems = cart.items.map((item: any) => ({
      productId: item.productId._id,
      name: (item.productId as any).name || "Unknown",
      category: (item.productId as any).category || "Unknown",
      price: item.price || 0,
      quantity: item.quantity || 0,
      manufacturer: (item.productId as any).manufacturer || "Unknown",
      expiryDate: (item.productId as any).expiryDate,
    }))

    const order = new Order({
      userId: userSession?.user?.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      promoCode: promoCode?.toUpperCase(),
      paymentStatus: "pending",
      orderStatus: "pending",
    })

    await order.save({ session })

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { inStock: -(item.quantity || 0) } }, { session })
    }

    // Clear cart
    await Cart.findOneAndDelete(cartQuery, { session })

    await session.commitTransaction()

    return NextResponse.json(
      {
        success: true,
        data: {
          ...order.toObject(),
          _id: order._id?.toString(),
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    await session.abortTransaction()
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to create order" }, { status: 500 })
  } finally {
    session.endSession()
  }
}
