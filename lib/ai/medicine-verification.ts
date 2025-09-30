import { OCRService } from "./ocr-service"

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

export class MedicineVerificationService {
  private static readonly KNOWN_MEDICINES = [
    "Paracetamol",
    "Ibuprofen",
    "Aspirin",
    "Amoxicillin",
    "Metformin",
    "Atorvastatin",
    "Omeprazole",
    "Losartan",
    "Amlodipine",
    "Simvastatin",
    "Lisinopril",
    "Levothyroxine",
    "Azithromycin",
    "Hydrochlorothiazide",
    "Gabapentin",
    "Sertraline",
    "Fluoxetine",
    "Citalopram",
    "Tramadol",
    "Codeine",
    "Morphine",
    "Diazepam",
    "Lorazepam",
    "Alprazolam",
  ]

  private static readonly CONTROLLED_SUBSTANCES = [
    "Morphine",
    "Codeine",
    "Tramadol",
    "Diazepam",
    "Lorazepam",
    "Alprazolam",
    "Oxycodone",
    "Hydrocodone",
    "Fentanyl",
    "Adderall",
  ]

  static async verifyMedicine(imageUrl: string): Promise<MedicineVerificationResult> {
    try {
      const ocrResult = await OCRService.validateMedicineImage(imageUrl)
      const issues: string[] = [...ocrResult.issues]
      const recommendations: string[] = []

      // Extract medicine details
      const medicineNames = await OCRService.extractMedicineName(imageUrl)
      const expiryDate = await OCRService.extractExpiryDate(imageUrl)

      let detectedMedicine: any = undefined
      let isValid = ocrResult.isValid

      // Validate detected medicines
      if (medicineNames.length > 0) {
        const recognizedMedicine = medicineNames.find((name) =>
          this.KNOWN_MEDICINES.some(
            (known) =>
              known.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(known.toLowerCase()),
          ),
        )

        if (recognizedMedicine) {
          detectedMedicine = {
            name: recognizedMedicine,
            dosage: this.extractDosage(ocrResult.detectedText),
            form: this.extractForm(ocrResult.detectedText),
          }

          // Check for controlled substances
          const isControlled = this.CONTROLLED_SUBSTANCES.some((controlled) =>
            recognizedMedicine.toLowerCase().includes(controlled.toLowerCase()),
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
      } else {
        issues.push("No medicine name detected")
        isValid = false
      }

      // Extract additional information
      const batchNumber = this.extractBatchNumber(ocrResult.detectedText)
      const manufacturer = this.extractManufacturer(ocrResult.detectedText)

      // Add recommendations based on findings
      if (expiryDate) {
        const monthsUntilExpiry = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))

        if (monthsUntilExpiry < 12) {
          recommendations.push("Medicine expires soon - prioritize for distribution")
        }
      }

      if (!batchNumber) {
        recommendations.push("Batch number not clearly visible - manual verification recommended")
      }

      return {
        isValid,
        confidence: ocrResult.confidence,
        detectedMedicine,
        expiryDate,
        batchNumber,
        manufacturer,
        issues,
        recommendations,
      }
    } catch (error) {
      console.error("Medicine verification error:", error)
      return {
        isValid: false,
        confidence: 0,
        issues: ["Failed to verify medicine"],
        recommendations: ["Please try with a clearer image"],
      }
    }
  }

  private static extractDosage(text: string): string | undefined {
    const dosagePattern = /(\d+(?:\.\d+)?)\s*(mg|ml|g|mcg|units?)/i
    const match = text.match(dosagePattern)
    return match ? `${match[1]}${match[2]}` : undefined
  }

  private static extractForm(text: string): string | undefined {
    const formPatterns = [
      /tablet/i,
      /capsule/i,
      /injection/i,
      /syrup/i,
      /cream/i,
      /ointment/i,
      /drops/i,
      /spray/i,
      /patch/i,
      /gel/i,
    ]

    for (const pattern of formPatterns) {
      if (pattern.test(text)) {
        return text.match(pattern)?.[0].toLowerCase()
      }
    }
    return undefined
  }

  private static extractBatchNumber(text: string): string | undefined {
    const batchPatterns = [/batch[:\s]*([A-Z0-9]+)/i, /lot[:\s]*([A-Z0-9]+)/i, /b\.?no[:\s]*([A-Z0-9]+)/i]

    for (const pattern of batchPatterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    return undefined
  }

  private static extractManufacturer(text: string): string | undefined {
    const manufacturerPatterns = [
      /mfg[:\s]*([A-Za-z\s]+)/i,
      /manufactured by[:\s]*([A-Za-z\s]+)/i,
      /mfd[:\s]*([A-Za-z\s]+)/i,
    ]

    for (const pattern of manufacturerPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1].trim().split(/\s{2,}/)[0] // Take first part before multiple spaces
      }
    }
    return undefined
  }

  static async batchVerifyMedicines(imageUrls: string[]): Promise<MedicineVerificationResult[]> {
    const results = await Promise.all(imageUrls.map((url) => this.verifyMedicine(url)))
    return results
  }
}
