import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Cart from "@/models/Cart"
import Product from "@/models/Product"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get("X-Session-ID")

    const query: any = {}

    if (session?.user?.id) {
      query.userId = new mongoose.Types.ObjectId(session.user.id)
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          totalItems: 0,
        },
      })
    }

    const cart = await Cart.findOne(query)
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .lean()

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          totalAmount: 0,
          totalItems: 0,
        },
      })
    }

    // Filter out products that are no longer available and format response
    const validItems = cart.items
      .filter((item: any) => {
        const product = item.productId
        return product && product.verified && product.inStock > 0 && new Date(product.expiryDate) > new Date()
      })
      .map((item: any) => ({
        productId: item.productId._id.toString(),
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        image: item.productId.image,
        inStock: item.productId.inStock,
        manufacturer: item.productId.manufacturer,
      }))

    return NextResponse.json({
      success: true,
      data: {
        items: validItems,
        totalAmount: cart.totalAmount,
        totalItems: cart.totalItems,
      },
    })
  } catch (error) {
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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    // Verify product exists and is available
    const product = await Product.findById(productId)
    if (!product || !product.verified || product.inStock < quantity || product.expiryDate <= new Date()) {
      return NextResponse.json({ success: false, error: "Product not available" }, { status: 400 })
    }

    const query: any = {}
    const cartData: any = {}

    if (session?.user?.id) {
      query.userId = new mongoose.Types.ObjectId(session.user.id)
      cartData.userId = new mongoose.Types.ObjectId(session.user.id)
    } else if (sessionId) {
      query.sessionId = sessionId
      cartData.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required for guest users" }, { status: 400 })
    }

    let cart = await Cart.findOne(query)

    if (!cart) {
      cart = new Cart({
        ...cartData,
        items: [],
      })
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId)

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity
      if (newQuantity > product.inStock) {
        return NextResponse.json({ success: false, error: "Not enough stock available" }, { status: 400 })
      }
      cart.items[existingItemIndex].quantity = newQuantity
    } else {
      // Add new item
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        price: product.price,
        addedAt: new Date(),
      })
    }

    await cart.save()

    // Populate product details for response
    await cart.populate({
      path: "items.productId",
      model: "Product",
    })

    return NextResponse.json({
      success: true,
      data: cart,
    })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ success: false, error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionId = request.headers.get("X-Session-ID")
    const body = await request.json()
    const { productId, quantity } = body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ success: false, error: "Invalid product ID" }, { status: 400 })
    }

    const query: any = {}

    if (session?.user?.id) {
      query.userId = new mongoose.Types.ObjectId(session.user.id)
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required for guest users" }, { status: 400 })
    }

    const cart = await Cart.findOne(query)
    if (!cart) {
      return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 })
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId)
    } else {
      // Update quantity
      const product = await Product.findById(productId)
      if (!product || quantity > product.inStock) {
        return NextResponse.json({ success: false, error: "Invalid quantity or insufficient stock" }, { status: 400 })
      }

      const itemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId)
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity
      }
    }

    await cart.save()
    await cart.populate({
      path: "items.productId",
      model: "Product",
    })

    return NextResponse.json({
      success: true,
      data: cart,
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 })
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
      query.userId = new mongoose.Types.ObjectId(session.user.id)
    } else if (sessionId) {
      query.sessionId = sessionId
    } else {
      return NextResponse.json({ success: false, error: "Session ID required for guest users" }, { status: 400 })
    }

    if (clearAll) {
      await Cart.findOneAndDelete(query)
      return NextResponse.json({
        success: true,
        message: "Cart cleared successfully",
      })
    }

    if (productId) {
      const cart = await Cart.findOne(query)
      if (cart) {
        cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId)
        await cart.save()
      }
    }

    return NextResponse.json({
      success: true,
      message: "Item removed successfully",
    })
  } catch (error) {
    console.error("Error removing from cart:", error)
    return NextResponse.json({ success: false, error: "Failed to remove from cart" }, { status: 500 })
  }
}
