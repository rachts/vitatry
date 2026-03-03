"use client"

import { AuthProvider } from "@/context/AuthContext"
import type React from "react"

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

// Keep the old export name for backwards compatibility
export { SupabaseAuthProvider as FirebaseAuthProvider }
