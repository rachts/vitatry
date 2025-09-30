import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Order from "@/models/Order"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = {}

    if (session?.user?.id) {
      query.userId = session.user.id
    } else {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
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

    const cartQuery: any = {}

    if (userSession?.user?.id) {
      cartQuery.userId = userSession.user.id
    } else if (sessionId) {
      cartQuery.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required for guest users" }, { status: 400 })
    }

    // Get cart
    const cart = await Cart.findOne(cartQuery).populate("items.productId").session(session)
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 })
    }

    // Validate stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id).session(session)
      if (!product || product.inStock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${(item.productId as any).name}` },
          { status: 400 },
        )
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let discount = 0

    // Apply promo code
    if (promoCode) {
      if (promoCode.toUpperCase() === "VITAMEND10") {
        discount = subtotal * 0.1
      } else if (promoCode.toUpperCase() === "HEALTH20") {
        discount = subtotal * 0.2
      }
    }

    const shipping = subtotal > 50 ? 0 : 9.99
    const tax = (subtotal - discount) * 0.08
    const total = subtotal - discount + shipping + tax

    // Create order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      name: (item.productId as any).name,
      category: (item.productId as any).category,
      price: item.price,
      quantity: item.quantity,
      manufacturer: (item.productId as any).manufacturer,
      expiryDate: (item.productId as any).expiryDate,
    }))

    // Create order
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
      await Product.findByIdAndUpdate(item.productId._id, { $inc: { inStock: -item.quantity } }, { session })
    }

    // Clear cart
    await Cart.findOneAndDelete(cartQuery, { session })

    await session.commitTransaction()

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 201 },
    )
  } catch (error) {
    await session.abortTransaction()
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  } finally {
    session.endSession()
  }
}
