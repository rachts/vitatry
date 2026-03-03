import { createClient } from "./client"

export interface Medicine {
  id: string
  name: string
  brand: string
  generic_name?: string
  dosage: string
  quantity: number
  expiry_date: string
  category: string
  condition: string
  available: boolean
  verified: boolean
  image_urls: string[]
  created_at: string
}

export async function getMedicines(): Promise<Medicine[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching medicines:", error)
    return []
  }

  return data || []
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("medicines").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching medicine:", error)
    return null
  }

  return data
}

// Subscribe to real-time changes
export function subscribeToMedicinesChanges(callback: (medicines: Medicine[]) => void) {
  const supabase = createClient()

  // Initial fetch
  getMedicines().then(callback)

  // Subscribe to changes
  const channel = supabase
    .channel("medicines-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "medicines",
      },
      () => {
        // Refetch on any change
        getMedicines().then(callback)
      },
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}
