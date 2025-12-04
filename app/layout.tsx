import type React from "react"
import type { Metadata, Viewport } from "next"
import ClientWrappers from "./_client-wrappers"
import Navigation from "@/components/navigation"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://vitamend.in"),
  title: {
    default: "VitaMend — Donate Unused Medicines | AI-Verified Distribution",
    template: "%s | VitaMend",
  },
  description:
    "VitaMend lets users donate unused medicines safely, verified with AI. Join our mission to reduce medicine waste and save lives through trusted NGO partners.",
  keywords: [
    "medicine donation",
    "donate medicines",
    "healthcare",
    "medicine redistribution",
    "AI verification",
    "NGO",
    "charity",
    "health",
    "medicine waste reduction",
    "unused medicines",
    "VitaMend",
  ],
  authors: [{ name: "VitaMend Team", url: "https://vitamend.in" }],
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
  alternates: {
    canonical: "https://vitamend.in",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vitamend.in",
    siteName: "VitaMend",
    title: "VitaMend — Donate Unused Medicines | AI-Verified Distribution",
    description:
      "Donate unused medicines and help those in need through AI-verified distribution. Join VitaMend to reduce medicine waste and save lives.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VitaMend - Reviving Medicines, Restoring Lives",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vitamend",
    creator: "@vitamend",
    title: "VitaMend — Donate Unused Medicines | AI-Verified Distribution",
    description: "Donate unused medicines and help those in need through AI-verified distribution.",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "Healthcare",
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
  colorScheme: "light dark",
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

        <link rel="preload" href="/images/design-mode/VITAMEND_LOGO.png" as="image" type="image/png" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 antialiased min-h-screen">
        <ErrorBoundary>
          <ClientWrappers>
            <SessionProvider>
              {/* Fixed height navbar wrapper to prevent CLS */}
              <div className="h-16">
                <Navigation />
              </div>
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Toaster />
            </SessionProvider>
          </ClientWrappers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
