"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  uid: string
  email: string | null
  name: string | null
  image: string | null
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Singleton Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClient
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const supabase = getSupabaseClient()
    let cancelled = false

    const setupAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (!cancelled) {
            setError(sessionError.message)
            setLoading(false)
          }
          return
        }

        if (session?.user && !cancelled) {
          await fetchUserProfile(session.user)
        } else if (!cancelled) {
          setUser(null)
          setLoading(false)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (cancelled) return

          if (session?.user) {
            await fetchUserProfile(session.user)
          } else {
            setUser(null)
          }
          setLoading(false)
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (err: any) {
        console.error("Error setting up auth:", err)
        if (!cancelled) {
          setError(err.message || "Failed to initialize authentication")
          setLoading(false)
        }
      }
    }

    const fetchUserProfile = async (supabaseUser: User) => {
      try {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", supabaseUser.id).single()

        setUser({
          uid: supabaseUser.id,
          email: supabaseUser.email || null,
          name: profile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
          image: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
          role: profile?.role || "donor",
        })
        setError(null)
      } catch (err) {
        // Profile might not exist yet, use basic user data
        setUser({
          uid: supabaseUser.id,
          email: supabaseUser.email || null,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
          image: supabaseUser.user_metadata?.avatar_url || null,
          role: "donor",
        })
      }
      setLoading(false)
    }

    setupAuth()

    return () => {
      cancelled = true
    }
  }, [mounted])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string, role = "donor") => {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        data: {
          full_name: name,
          name: name,
        },
      },
    })

    if (error) throw error

    // Create profile after signup
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        role,
      })
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
