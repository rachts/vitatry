"use client"

import { AuthProvider } from "@/context/AuthContext"
import type React from "react"

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
