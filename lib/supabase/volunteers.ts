import { createClient } from "./client"

export interface VolunteerData {
  fullName: string
  email: string
  phone: string
  address: string
  dateOfBirth?: string
  occupation?: string
  experience?: string
  availability?: string
  role?: string
  motivation?: string
  emergencyContact?: string
  emergencyPhone?: string
  hasTransport?: boolean
  canLift?: boolean
  medicalConditions?: string
  references?: string
}

export async function submitVolunteerApplication(
  data: VolunteerData,
): Promise<{ success: boolean; message: string; id?: string }> {
  const supabase = createClient()

  try {
    const { data: volunteer, error } = await supabase
      .from("volunteers")
      .insert({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date_of_birth: data.dateOfBirth || null,
        occupation: data.occupation || null,
        experience: data.experience || null,
        availability: data.availability || null,
        role: data.role || null,
        motivation: data.motivation || null,
        emergency_contact: data.emergencyContact || null,
        emergency_phone: data.emergencyPhone || null,
        has_transport: data.hasTransport || false,
        can_lift: data.canLift || false,
        medical_conditions: data.medicalConditions || null,
        references: data.references || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error submitting volunteer application:", error)
      throw new Error(error.message)
    }

    return {
      success: true,
      message: "Application submitted successfully! We will contact you soon.",
      id: volunteer.id,
    }
  } catch (error: any) {
    console.error("Error in submitVolunteerApplication:", error)
    return {
      success: false,
      message: error.message || "Failed to submit application. Please try again.",
    }
  }
}

export async function getVolunteers() {
  const supabase = createClient()

  const { data, error } = await supabase.from("volunteers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching volunteers:", error)
    return []
  }

  return data
}
