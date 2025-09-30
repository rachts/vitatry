"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faf8] to-[#f8faff] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <WifiOff className="mx-auto h-12 w-12 text-[#2ea043] mb-4" />
          <CardTitle className="text-2xl text-[#1a472a]">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-[#2d3748]">
            It looks like you're currently offline. Some features of VitaMend may not be available until you reconnect.
          </p>
          <p className="text-[#2d3748]">
            Don't worry, any forms you submit while offline will be automatically sent when you're back online.
          </p>
          <div className="flex flex-col gap-2 mt-6">
            <Button asChild className="bg-[#2ea043] hover:bg-[#2ea043]/90">
              <Link href="/">Go to Homepage</Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
