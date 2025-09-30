/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function requireUser() {
  const session = await getServerSession(authOptions).catch(() => null)
  if (!session?.user) return null
  return session
}

export async function requireAdmin() {
  const session = await requireUser()
  // @ts-ignore role is augmented in types/next-auth.d.ts in this project
  const isAdmin = session?.user?.role === "admin"
  if (!isAdmin) return null
  return session
}
