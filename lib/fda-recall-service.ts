interface FDARecall {
  recall_number: string
  product_description: string
  reason_for_recall: string
  classification: string
  status: string
  recall_initiation_date: string
  product_type: string
}

export class FDARecallService {
  private static readonly FDA_API_BASE = "https://api.fda.gov/drug/enforcement.json"

  static async checkForRecalls(): Promise<FDARecall[]> {
    try {
      // Get recalls from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const dateFilter = thirtyDaysAgo.toISOString().split("T")[0].replace(/-/g, "")

      const response = await fetch(`${this.FDA_API_BASE}?search=recall_initiation_date:[${dateFilter}+TO+*]&limit=100`)

      if (!response.ok) {
        throw new Error("Failed to fetch FDA recalls")
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error("Error fetching FDA recalls:", error)
      return []
    }
  }

  static async checkMedicineAgainstRecalls(medicineName: string): Promise<FDARecall[]> {
    try {
      const encodedName = encodeURIComponent(medicineName)
      const response = await fetch(`${this.FDA_API_BASE}?search=product_description:"${encodedName}"&limit=10`)

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error("Error checking medicine against recalls:", error)
      return []
    }
  }

  static extractMedicineNames(productDescription: string): string[] {
    // Extract medicine names from FDA product descriptions
    // This is a simplified version - in production, you'd want more sophisticated parsing
    const commonPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:tablets?|capsules?|injection|syrup)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\d+\s*mg/gi,
    ]

    const names = new Set<string>()

    for (const pattern of commonPatterns) {
      const matches = productDescription.matchAll(pattern)
      for (const match of matches) {
        names.add(match[1].trim())
      }
    }

    return Array.from(names)
  }
}
