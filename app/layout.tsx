import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { SessionProvider } from "@/components/session-provider"
import Navigation from "@/components/navigation"
import { CartProvider } from "@/components/shop/cart-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VitaMend - Medicine Donation Platform",
  description: "Donate unused medicines and help reduce medical waste while improving healthcare access.",
  keywords: "medicine donation, healthcare, medical waste, charity, NGO",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Toaster position="top-right" richColors closeButton duration={4000} />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
