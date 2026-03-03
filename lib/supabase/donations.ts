import { createClient } from "./client"
import { uploadMultipleImages } from "./storage"

export interface DonationData {
  medicineName: string
  brand: string
  genericName?: string
  dosage: string
  quantity: number
  expiryDate: string
  condition: string
  category: string
  donorName: string
  donorEmail: string
  donorPhone: string
  donorAddress: string
  notes?: string
  files?: File[]
}

export async function submitDonation(data: DonationData): Promise<{ success: boolean; message: string; id?: string }> {
  const supabase = createClient()

  try {
    // Upload images if provided
    let imageUrls: string[] = []
    if (data.files && data.files.length > 0) {
      imageUrls = await uploadMultipleImages(data.files, "donations")
    }

    // Insert donation record
    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        medicine_name: data.medicineName,
        brand: data.brand,
        generic_name: data.genericName || null,
        dosage: data.dosage,
        quantity: data.quantity,
        expiry_date: data.expiryDate,
        condition: data.condition,
        category: data.category,
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        donor_address: data.donorAddress,
        notes: data.notes || null,
        image_urls: imageUrls,
        status: "pending",
        verified: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error submitting donation:", error)
      throw new Error(error.message)
    }

    return {
      success: true,
      message: "Donation submitted successfully! We will contact you soon for pickup.",
      id: donation.id,
    }
  } catch (error: any) {
    console.error("Error in submitDonation:", error)
    return {
      success: false,
      message: error.message || "Failed to submit donation. Please try again.",
    }
  }
}

export async function getDonations() {
  const supabase = createClient()

  const { data, error } = await supabase.from("donations").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching donations:", error)
    return []
  }

  return data
}
