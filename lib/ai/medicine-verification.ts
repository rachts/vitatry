/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */

export interface MedicineVerificationResult {
  isValid: boolean
  confidence: number
  detectedMedicine?: {
    name: string
    dosage?: string
    form?: string
  }
  expiryDate?: Date
  batchNumber?: string
  manufacturer?: string
  issues: string[]
  recommendations: string[]
}

interface VerifyMedicineInput {
  imageUrl: string
  medicineName?: string
  batchNumber?: string
  expiryDate?: string
}

const KNOWN_MEDICINES = [
  "Paracetamol",
  "Ibuprofen",
  "Aspirin",
  "Amoxicillin",
  "Metformin",
  "Atorvastatin",
  "Omeprazole",
]

const CONTROLLED_SUBSTANCES = ["Morphine", "Codeine", "Tramadol", "Diazepam"]

export async function verifyMedicine(input: VerifyMedicineInput): Promise<MedicineVerificationResult> {
  const issues: string[] = []
  const recommendations: string[] = []
  let isValid = true
  let confidence = 0.8

  if (!input.imageUrl) {
    issues.push("No image provided")
    isValid = false
    confidence = 0
  }

  if (input.medicineName) {
    const recognized = KNOWN_MEDICINES.some(
      (known) =>
        known.toLowerCase().includes(input.medicineName!.toLowerCase()) ||
        input.medicineName!.toLowerCase().includes(known.toLowerCase()),
    )
    if (recognized) {
      const isControlled = CONTROLLED_SUBSTANCES.some((controlled) =>
        input.medicineName!.toLowerCase().includes(controlled.toLowerCase()),
      )
      if (isControlled) {
        issues.push("Controlled substance detected - requires special handling")
        recommendations.push("Contact pharmacy for proper disposal procedures")
        isValid = false
      }
    } else {
      issues.push("Medicine not recognized in our database")
      recommendations.push("Please verify medicine name manually")
    }
  }

  if (input.expiryDate) {
    const expiry = new Date(input.expiryDate)
    const now = new Date()
    if (expiry < now) {
      issues.push("Medicine has expired")
      isValid = false
    } else {
      const monthsUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
      if (monthsUntilExpiry < 6) {
        recommendations.push("Medicine expires soon - prioritize for distribution")
      }
    }
  }

  return {
    isValid,
    confidence,
    detectedMedicine: input.medicineName
      ? {
          name: input.medicineName,
          dosage: undefined,
          form: undefined,
        }
      : undefined,
    expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
    batchNumber: input.batchNumber,
    manufacturer: undefined,
    issues,
    recommendations,
  }
}
