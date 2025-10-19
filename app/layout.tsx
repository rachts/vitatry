import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/context/ThemeContext"
import Navigation from "@/components/navigation"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "VitaMend - Reviving Medicines, Restoring Lives",
  description: "Donate unused medicines and help those in need through AI-verified distribution.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
        <ThemeProvider>
          <SessionProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
