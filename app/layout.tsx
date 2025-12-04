import type React from "react"
import type { Metadata, Viewport } from "next"
import ClientWrappers from "./_client-wrappers"
import Navigation from "@/components/navigation"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://vitamend.vercel.app"),
  title: {
    default: "VitaMend - Reviving Medicines, Restoring Lives",
    template: "%s | VitaMend",
  },
  description:
    "Donate unused medicines and help those in need through AI-verified distribution. Join VitaMend to reduce medicine waste and save lives.",
  keywords: [
    "medicine donation",
    "healthcare",
    "medicine redistribution",
    "AI verification",
    "NGO",
    "charity",
    "health",
    "medicine waste reduction",
  ],
  authors: [{ name: "VitaMend Team" }],
  creator: "VitaMend",
  publisher: "VitaMend",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "VitaMend",
    title: "VitaMend - Reviving Medicines, Restoring Lives",
    description:
      "Donate unused medicines and help those in need through AI-verified distribution. Join VitaMend to reduce medicine waste and save lives.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VitaMend - Reviving Medicines, Restoring Lives",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VitaMend - Reviving Medicines, Restoring Lives",
    description: "Donate unused medicines and help those in need through AI-verified distribution.",
    images: ["/og-image.png"],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 antialiased min-h-screen">
        <ErrorBoundary>
          <ClientWrappers>
            <SessionProvider>
              <Navigation />
              <main className="min-h-screen">{children}</main>
              <Toaster />
            </SessionProvider>
          </ClientWrappers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
