import dbConnect from "./dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"

export interface DonationReport {
  donor: {
    name: string
    email: string
    totalDonations: number
    totalMedicines: number
    creditsEarned: number
    joinDate: string
  }
  donations: Array<{
    id: string
    date: string
    medicines: Array<{
      name: string
      quantity: number
      expiryDate: string
    }>
    status: string
    creditsEarned: number
    estimatedLivesHelped: number
  }>
  impact: {
    totalLivesHelped: number
    wasteReduced: number // in kg
    co2Saved: number // in kg
    communitiesReached: number
  }
  period: {
    from: string
    to: string
  }
}

export class ReportGenerator {
  static async generateDonorReport(userId: string, fromDate?: Date, toDate?: Date): Promise<DonationReport> {
    await dbConnect()

    const from = fromDate || new Date(new Date().getFullYear(), 0, 1) // Start of year
    const to = toDate || new Date() // Today

    const user = await User.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const donations = await Donation.find({
      userId,
      createdAt: { $gte: from, $lte: to },
    }).sort({ createdAt: -1 })

    const totalMedicines = donations.reduce((sum, donation) => {
      return sum + (donation.medicines?.length || 0)
    }, 0)

    const totalCreditsEarned = donations.reduce((sum, donation) => {
      return sum + (donation.creditsEarned || 0)
    }, 0)

    // Calculate impact metrics
    const totalLivesHelped = this.calculateLivesHelped(donations)
    const wasteReduced = this.calculateWasteReduced(donations)
    const co2Saved = this.calculateCO2Saved(wasteReduced)

    const report: DonationReport = {
      donor: {
        name: user.name,
        email: user.email,
        totalDonations: donations.length,
        totalMedicines,
        creditsEarned: totalCreditsEarned,
        joinDate: user.createdAt.toISOString(),
      },
      donations: donations.map((donation) => ({
        id: donation._id.toString(),
        date: donation.createdAt.toISOString(),
        medicines: donation.medicines.map((med) => ({
          name: med.name,
          quantity: med.quantity,
          expiryDate: med.expiryDate.toISOString(),
        })),
        status: donation.status,
        creditsEarned: donation.creditsEarned || 0,
        estimatedLivesHelped: this.estimateLivesHelped(donation.medicines),
      })),
      impact: {
        totalLivesHelped,
        wasteReduced,
        co2Saved,
        communitiesReached: Math.ceil(totalLivesHelped / 50), // Estimate communities
      },
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    }

    return report
  }

  private static calculateLivesHelped(donations: any[]): number {
    return donations.reduce((total, donation) => {
      if (donation.status === "distributed") {
        return total + this.estimateLivesHelped(donation.medicines)
      }
      return total
    }, 0)
  }

  private static estimateLivesHelped(medicines: any[]): number {
    // Estimate based on medicine quantity and type
    return medicines.reduce((total, medicine) => {
      // Rough estimate: each medicine unit can help 0.1 people on average
      return total + Math.floor(medicine.quantity * 0.1)
    }, 0)
  }

  private static calculateWasteReduced(donations: any[]): number {
    // Estimate waste reduced in kg
    return donations.reduce((total, donation) => {
      const medicineCount = donation.medicines?.length || 0
      return total + medicineCount * 0.05 // Assume 50g per medicine on average
    }, 0)
  }

  private static calculateCO2Saved(wasteReduced: number): number {
    // Medical waste incineration produces ~1.5kg CO2 per kg of waste
    return wasteReduced * 1.5
  }

  static async generateCSRReport(organizationId?: string): Promise<any> {
    await dbConnect()

    const query = organizationId ? { "profile.organization": organizationId } : {}
    const users = await User.find(query)
    const userIds = users.map((u) => u._id)

    const donations = await Donation.find({
      userId: { $in: userIds },
      status: "distributed",
    })

    const totalMedicines = donations.reduce((sum, d) => sum + (d.medicines?.length || 0), 0)
    const totalLivesHelped = this.calculateLivesHelped(donations)
    const wasteReduced = this.calculateWasteReduced(donations)
    const co2Saved = this.calculateCO2Saved(wasteReduced)

    return {
      organization: organizationId || "All Organizations",
      period: {
        from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
        to: new Date().toISOString(),
      },
      metrics: {
        totalDonors: users.length,
        totalDonations: donations.length,
        totalMedicines,
        livesImpacted: totalLivesHelped,
        environmentalImpact: {
          wasteReduced: `${wasteReduced.toFixed(2)} kg`,
          co2Saved: `${co2Saved.toFixed(2)} kg CO₂`,
          equivalentTrees: Math.ceil(co2Saved / 22), // 1 tree absorbs ~22kg CO2/year
        },
      },
      breakdown: {
        byMonth: await this.getMonthlyBreakdown(userIds),
        byMedicineType: await this.getMedicineTypeBreakdown(donations),
      },
    }
  }

  private static async getMonthlyBreakdown(userIds: string[]): Promise<any[]> {
    const pipeline = [
      {
        $match: {
          userId: { $in: userIds },
          status: "distributed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          medicines: { $sum: { $size: "$medicines" } },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]

    return await Donation.aggregate(pipeline)
  }

  private static async getMedicineTypeBreakdown(donations: any[]): Promise<any[]> {
    const medicineTypes: Record<string, number> = {}

    donations.forEach((donation) => {
      donation.medicines?.forEach((medicine: any) => {
        const type = this.categorizeMedicine(medicine.name)
        medicineTypes[type] = (medicineTypes[type] || 0) + medicine.quantity
      })
    })

    return Object.entries(medicineTypes).map(([type, quantity]) => ({
      type,
      quantity,
    }))
  }

  private static categorizeMedicine(name: string): string {
    const categories = {
      "Pain Relief": ["paracetamol", "ibuprofen", "aspirin", "acetaminophen"],
      Antibiotics: ["amoxicillin", "azithromycin", "ciprofloxacin", "penicillin"],
      "Heart & Blood": ["metformin", "lisinopril", "amlodipine", "atorvastatin"],
      Respiratory: ["albuterol", "montelukast", "prednisone"],
      "Mental Health": ["sertraline", "fluoxetine", "lorazepam"],
    }

    const lowerName = name.toLowerCase()
    for (const [category, medicines] of Object.entries(categories)) {
      if (medicines.some((med) => lowerName.includes(med))) {
        return category
      }
    }

    return "Other"
  }
}
