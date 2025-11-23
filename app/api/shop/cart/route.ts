import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
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
    const sessionId = request.headers.get("X-Session-ID")

    const query: any = {}

    if (session?.user?.id) {
      try {
        query.userId = new mongoose.Types.ObjectId(session.user.id)
      } catch (e) {
        console.error("Invalid user ID:", e)
        return NextResponse.json({ success: true, data: { items: [], totalAmount: 0, totalItems: 0 } })
      }
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({
        success: true,
        data: { items: [], totalAmount: 0, totalItems: 0 },
      })
    }

    const cart = await Cart.findOne(query).populate("items.productId").lean()

    if (!cart || !Array.isArray(cart.items)) {
      return NextResponse.json({
        success: true,
        data: { items: [], totalAmount: 0, totalItems: 0 },
      })
    }

    const now = new Date()
    const validItems = cart.items
      .filter((item: any) => {
        const product = item?.productId
        return product && product.verified === true && product.inStock > 0 && new Date(product.expiryDate) > now
      })
      .map((item: any) => ({
        productId: item.productId._id?.toString(),
        name: item.productId.name || "Unknown",
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.productId.image,
        inStock: item.productId.inStock || 0,
        manufacturer: item.productId.manufacturer,
      }))

    const totalAmount = validItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const totalItems = validItems.reduce((sum: number, item: any) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        totalAmount,
        totalItems,
      },
    })
  } catch (error: any) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get("X-Session-ID")
    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID format" }, { status: 400 })
    }

    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json({ success: false, error: "Quantity must be a positive number" }, { status: 400 })
    }

    const product = await Product.findById(productId).lean()
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    if (!product.verified) {
      return NextResponse.json({ success: false, error: "Product is not available for purchase" }, { status: 400 })
    }

    if (product.inStock < quantity) {
      return NextResponse.json(
        { success: false, error: `Only ${product.inStock} items available in stock` },
        { status: 400 },
      )
    }

    if (new Date(product.expiryDate) <= new Date()) {
      return NextResponse.json({ success: false, error: "Product has expired" }, { status: 400 })
    }

    const query: any = {}
    const cartData: any = {}

    if (session?.user?.id) {
      try {
        query.userId = new mongoose.Types.ObjectId(session.user.id)
        cartData.userId = new mongoose.Types.ObjectId(session.user.id)
      } catch (e) {
        console.error("Invalid user ID:", e)
        return NextResponse.json({ success: false, error: "Invalid session" }, { status: 400 })
      }
    } else if (sessionId) {
      query.sessionId = sessionId
      cartData.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
    }

    let cart = await Cart.findOne(query)

    if (!cart) {
      cart = new Cart({
        ...cartData,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      })
    }

    const existingItemIndex = (cart.items || []).findIndex((item: any) => item?.productId?.toString() === productId)

    if (existingItemIndex > -1) {
      const newQuantity = (cart.items[existingItemIndex].quantity || 0) + quantity
      if (newQuantity > product.inStock) {
        return NextResponse.json({ success: false, error: "Not enough stock available" }, { status: 400 })
      }
      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        price: product.price,
        addedAt: new Date(),
      })
    }

    cart.totalItems = cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    cart.totalAmount = cart.items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0)

    await cart.save()
    await cart.populate("items.productId")

    return NextResponse.json(
      {
        success: true,
        data: cart,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to add to cart" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get("X-Session-ID")
    const body = await request.json()
    const { productId, quantity } = body

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return NextResponse.json({ success: false, error: "Quantity must be a non-negative number" }, { status: 400 })
    }

    const query: any = {}

    if (session?.user?.id) {
      try {
        query.userId = new mongoose.Types.ObjectId(session.user.id)
      } catch (e) {
        return NextResponse.json({ success: false, error: "Invalid session" }, { status: 400 })
      }
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
    }

    const cart = await Cart.findOne(query)
    if (!cart) {
      return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 })
    }

    if (quantity === 0) {
      cart.items = (cart.items || []).filter((item: any) => item?.productId?.toString() !== productId)
    } else {
      const product = await Product.findById(productId).lean()
      if (!product) {
        return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
      }

      if (quantity > product.inStock) {
        return NextResponse.json({ success: false, error: `Only ${product.inStock} items available` }, { status: 400 })
      }

      const itemIndex = (cart.items || []).findIndex((item: any) => item?.productId?.toString() === productId)
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity
      }
    }

    cart.totalItems = (cart.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    cart.totalAmount = (cart.items || []).reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    )

    await cart.save()
    await cart.populate("items.productId")

    return NextResponse.json({
      success: true,
      data: cart,
    })
  } catch (error: any) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to update cart" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get("X-Session-ID")
    const body = await request.json()
    const { productId, clearAll } = body

    const query: any = {}

    if (session?.user?.id) {
      try {
        query.userId = new mongoose.Types.ObjectId(session.user.id)
      } catch (e) {
        return NextResponse.json({ success: false, error: "Invalid session" }, { status: 400 })
      }
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
    }

    if (clearAll) {
      await Cart.findOneAndDelete(query)
      return NextResponse.json({
        success: true,
        message: "Cart cleared successfully",
      })
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      const cart = await Cart.findOne(query)
      if (cart) {
        cart.items = (cart.items || []).filter((item: any) => item?.productId?.toString() !== productId)
        cart.totalItems = (cart.items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
        cart.totalAmount = (cart.items || []).reduce(
          (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
          0,
        )
        await cart.save()
      }
    }

    return NextResponse.json({
      success: true,
      message: "Item removed successfully",
    })
  } catch (error: any) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to remove from cart" }, { status: 500 })
  }
}
