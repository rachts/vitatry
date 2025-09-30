"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, requireAuth, router])

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}

export function useRequireRole(allowedRoles: string[]) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      router.push("/dashboard")
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router])

  return {
    user,
    isLoading,
    isAuthenticated,
    hasAccess: user?.role ? allowedRoles.includes(user.role) : false,
  }
}
