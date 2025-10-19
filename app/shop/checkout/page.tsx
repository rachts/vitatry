export const dynamic = "force-dynamic"
export const revalidate = 0

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/dbConnect"
import Cart from "@/models/Cart"

async function CheckoutContent() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/shop/checkout")
  }

  await dbConnect()

  const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId").lean()
  const items = cart?.items ?? []

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-gray-600">Add items to your cart before checking out</p>
        <a href="/shop" className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          Continue Shopping
        </a>
      </div>
    )
  }

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0)
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="divide-y">
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-4">
                  <div>
                    <p className="font-medium">{item.productId?.name ?? "Unknown Product"}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity ?? 0}</p>
                  </div>
                  <p className="font-medium">₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Price Breakdown</h2>
          <div className="space-y-3 border-b pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button className="mt-6 w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex items-center justify-center py-16">
          <p>Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
