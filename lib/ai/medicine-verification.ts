/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */

interface VerificationResult {
  isValid: boolean
  confidence: number
  issues: string[]
  recommendation: string
  details?: Record<string, any>
}

interface MedicineInput {
  imageUrl: string
  medicineName?: string
  batchNumber?: string
  expiryDate?: string
}

export async function verifyMedicine(input: MedicineInput): Promise<VerificationResult> {
  const issues: string[] = []
  let confidence = 0.95

  if (!input.imageUrl) {
    return {
      isValid: false,
      confidence: 0,
      issues: ["Image URL is required"],
      recommendation: "rejected",
    }
  }

  if (input.expiryDate) {
    const expiry = new Date(input.expiryDate)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

    if (expiry < sixMonthsFromNow) {
      issues.push("Medicine expires in less than 6 months")
      confidence -= 0.5
    }
  }

  const isValid = issues.length === 0 && confidence >= 0.7
  const recommendation = isValid ? "approved" : confidence >= 0.5 ? "manual_review" : "rejected"

  return {
    isValid,
    confidence,
    issues,
    recommendation,
    details: {
      medicineName: input.medicineName,
      batchNumber: input.batchNumber,
      expiryDate: input.expiryDate,
    },
  }
}

export class MedicineVerificationService {
  static async verifyMedicine(imageUrl: string): Promise<VerificationResult> {
    return verifyMedicine({ imageUrl })
  }

  static async verifyWithDetails(input: MedicineInput): Promise<VerificationResult> {
    return verifyMedicine(input)
  }
}
