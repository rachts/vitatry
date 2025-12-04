export const dynamic = "force-dynamic"
export const revalidate = 0

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Cart from "@/models/Cart"
import mongoose from "mongoose"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, ArrowLeft } from "lucide-react"

async function CheckoutContent() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      redirect("/auth/signin?callbackUrl=/shop/checkout")
    }

    await dbConnect()

    let cart = null
    try {
      if (mongoose.Types.ObjectId.isValid(session.user.id)) {
        cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(session.user.id) })
          .populate("items.productId")
          .lean()
      }
    } catch (e) {
      console.error("Error fetching cart:", e)
    }

    const items = cart?.items ?? []

    if (!items || items.length === 0) {
      return (
        <div className="container mx-auto flex flex-col items-center justify-center gap-6 py-16 text-center px-4">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6">
            <ShoppingBag className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your cart is empty</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md">
            Add items to your cart before checking out. Browse our verified medicines and health products.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      )
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const price = item?.price ?? 0
      const quantity = item?.quantity ?? 0
      return sum + price * quantity
    }, 0)

    const tax = Math.round(subtotal * 0.08 * 100) / 100
    const shipping = subtotal > 50 ? 0 : 9.99
    const total = Math.round((subtotal + tax + shipping) * 100) / 100

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <Link href="/shop" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Checkout</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary ({items.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y dark:divide-slate-700">
                  {items.map((item: any, idx: number) => {
                    const product = item?.productId
                    const name = product?.name ?? "Unknown Product"
                    const manufacturer = product?.manufacturer ?? ""
                    const price = item?.price ?? 0
                    const quantity = item?.quantity ?? 0

                    return (
                      <div key={idx} className="flex justify-between py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{name}</p>
                          {manufacturer && <p className="text-sm text-slate-500 dark:text-slate-400">{manufacturer}</p>}
                          <p className="text-sm text-slate-600 dark:text-slate-400">Qty: {quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">${(price * quantity).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 border-b dark:border-slate-700 pb-4">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-600" : ""}>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700">Proceed to Payment</Button>
                <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
                  Secure checkout powered by Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Checkout error:", error)
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
        <p className="text-slate-600 dark:text-slate-400">Unable to load checkout. Please try again.</p>
        <Button asChild variant="outline">
          <Link href="/shop">Return to Shop</Link>
        </Button>
      </div>
    )
  }
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="text-slate-600 dark:text-slate-400">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
