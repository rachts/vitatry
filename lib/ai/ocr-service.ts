/**
 * OCR Service for VitaMend
 * Developed by Rachit
 *
 * This service uses Tesseract.js to extract text from medicine images,
 * identify expiry dates, and validate medicine packaging.
 */
import Tesseract from "tesseract.js"

export interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
}

export class OCRService {
  private static worker: Tesseract.Worker | null = null

  static async initializeWorker(): Promise<Tesseract.Worker> {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker("eng")
      await this.worker.setParameters({
        tessedit_char_whitelist: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz/-: ",
      })
    }
    return this.worker
  }

  static async extractText(imageUrl: string): Promise<OCRResult> {
    try {
      const worker = await this.initializeWorker()
      const result = await worker.recognize(imageUrl)

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words.map((word) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox,
        })),
      }
    } catch (error) {
      console.error("OCR Error:", error)
      throw new Error("Failed to extract text from image")
    }
  }

  static async extractExpiryDate(imageUrl: string): Promise<Date | null> {
    try {
      const ocrResult = await this.extractText(imageUrl)
      const text = ocrResult.text

      // Common expiry date patterns
      const patterns = [
        /EXP[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
        /EXPIRY[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i,
        /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
        /(\d{2,4})[/-](\d{1,2})[/-](\d{1,2})/,
      ]

      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match) {
          const [, part1, part2, part3] = match

          // Handle different date formats
          let month: number, day: number, year: number

          if (part3.length === 4) {
            // Format: MM/DD/YYYY or DD/MM/YYYY
            month = Number.parseInt(part1)
            day = Number.parseInt(part2)
            year = Number.parseInt(part3)
          } else {
            // Format: MM/DD/YY or DD/MM/YY
            month = Number.parseInt(part1)
            day = Number.parseInt(part2)
            year = Number.parseInt(part3) + (Number.parseInt(part3) > 50 ? 1900 : 2000)
          }

          // Validate month and day
          if (month > 12) {
            ;[month, day] = [day, month] // Swap if month > 12
          }

          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return new Date(year, month - 1, day)
          }
        }
      }

      return null
    } catch (error) {
      console.error("Error extracting expiry date:", error)
      return null
    }
  }

  static async extractMedicineName(imageUrl: string): Promise<string[]> {
    try {
      const ocrResult = await this.extractText(imageUrl)
      const text = ocrResult.text

      // Common medicine name patterns
      const patterns = [
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:tablets?|capsules?|injection|syrup|mg|ml)/gi,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\d+\s*(?:mg|ml|g)/gi,
      ]

      const names = new Set<string>()

      for (const pattern of patterns) {
        const matches = text.matchAll(pattern)
        for (const match of matches) {
          const name = match[1].trim()
          if (name.length > 2) {
            names.add(name)
          }
        }
      }

      return Array.from(names)
    } catch (error) {
      console.error("Error extracting medicine names:", error)
      return []
    }
  }

  static async validateMedicineImage(imageUrl: string): Promise<{
    isValid: boolean
    confidence: number
    detectedText: string
    issues: string[]
  }> {
    try {
      const ocrResult = await this.extractText(imageUrl)
      const issues: string[] = []
      let isValid = true

      // Check if text was detected
      if (!ocrResult.text || ocrResult.text.trim().length < 10) {
        issues.push("Insufficient text detected in image")
        isValid = false
      }

      // Check for common medicine packaging indicators
      const medicineIndicators = [/tablet/i, /capsule/i, /mg/i, /ml/i, /exp/i, /mfg/i, /batch/i]

      const hasIndicators = medicineIndicators.some((pattern) => pattern.test(ocrResult.text))

      if (!hasIndicators) {
        issues.push("No medicine packaging indicators found")
        isValid = false
      }

      // Check for expiry date
      const expiryDate = await this.extractExpiryDate(imageUrl)
      if (!expiryDate) {
        issues.push("No valid expiry date found")
        isValid = false
      } else {
        const sixMonthsFromNow = new Date()
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)

        if (expiryDate < sixMonthsFromNow) {
          issues.push("Medicine expires within 6 months")
          isValid = false
        }
      }

      return {
        isValid,
        confidence: ocrResult.confidence,
        detectedText: ocrResult.text,
        issues,
      }
    } catch (error) {
      console.error("Error validating medicine image:", error)
      return {
        isValid: false,
        confidence: 0,
        detectedText: "",
        issues: ["Failed to process image"],
      }
    }
  }

  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }
}
