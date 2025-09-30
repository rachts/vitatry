import dbConnect from "./dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"

export interface SustainabilityMetrics {
  co2Saved: number // kg CO2
  wasteReduced: number // kg
  waterSaved: number // liters
  energySaved: number // kWh
  treesEquivalent: number
  carbonFootprintReduction: number // percentage
}

export interface UserAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  category: "environmental" | "social" | "milestone"
}

export class SustainabilityTracker {
  // Medicine production environmental impact factors
  private static readonly IMPACT_FACTORS = {
    co2PerMedicine: 0.5, // kg CO2 per medicine unit
    waterPerMedicine: 2.5, // liters per medicine unit
    energyPerMedicine: 0.8, // kWh per medicine unit
    wastePerMedicine: 0.05, // kg waste per medicine unit
  }

  static async calculateUserImpact(userId: string): Promise<SustainabilityMetrics> {
    await dbConnect()

    const donations = await Donation.find({
      userId,
      status: { $in: ["verified", "collected", "distributed"] },
    })

    const totalMedicines = donations.reduce((sum, donation) => {
      return sum + donation.medicines.reduce((medSum, med) => medSum + med.quantity, 0)
    }, 0)

    const co2Saved = totalMedicines * this.IMPACT_FACTORS.co2PerMedicine
    const wasteReduced = totalMedicines * this.IMPACT_FACTORS.wastePerMedicine
    const waterSaved = totalMedicines * this.IMPACT_FACTORS.waterPerMedicine
    const energySaved = totalMedicines * this.IMPACT_FACTORS.energyPerMedicine

    return {
      co2Saved,
      wasteReduced,
      waterSaved,
      energySaved,
      treesEquivalent: Math.ceil(co2Saved / 22), // 1 tree absorbs ~22kg CO2/year
      carbonFootprintReduction: this.calculateFootprintReduction(co2Saved),
    }
  }

  static async calculateGlobalImpact(): Promise<SustainabilityMetrics> {
    await dbConnect()

    const donations = await Donation.find({
      status: { $in: ["verified", "collected", "distributed"] },
    })

    const totalMedicines = donations.reduce((sum, donation) => {
      return sum + donation.medicines.reduce((medSum, med) => medSum + med.quantity, 0)
    }, 0)

    const co2Saved = totalMedicines * this.IMPACT_FACTORS.co2PerMedicine
    const wasteReduced = totalMedicines * this.IMPACT_FACTORS.wastePerMedicine
    const waterSaved = totalMedicines * this.IMPACT_FACTORS.waterPerMedicine
    const energySaved = totalMedicines * this.IMPACT_FACTORS.energyPerMedicine

    return {
      co2Saved,
      wasteReduced,
      waterSaved,
      energySaved,
      treesEquivalent: Math.ceil(co2Saved / 22),
      carbonFootprintReduction: this.calculateFootprintReduction(co2Saved),
    }
  }

  private static calculateFootprintReduction(co2Saved: number): number {
    // Average person's annual carbon footprint is ~4000kg CO2
    return (co2Saved / 4000) * 100
  }

  static async checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
    const impact = await this.calculateUserImpact(userId)
    const donations = await Donation.find({ userId }).countDocuments()

    const achievements: UserAchievement[] = []

    // Environmental achievements
    if (impact.co2Saved >= 10 && !(await this.hasAchievement(userId, "eco-warrior"))) {
      achievements.push({
        id: "eco-warrior",
        name: "Eco Warrior",
        description: "Saved 10kg of CO₂ emissions",
        icon: "🌱",
        unlockedAt: new Date(),
        category: "environmental",
      })
    }

    if (impact.treesEquivalent >= 1 && !(await this.hasAchievement(userId, "tree-saver"))) {
      achievements.push({
        id: "tree-saver",
        name: "Tree Saver",
        description: "Impact equivalent to planting a tree",
        icon: "🌳",
        unlockedAt: new Date(),
        category: "environmental",
      })
    }

    // Milestone achievements
    if (donations >= 5 && !(await this.hasAchievement(userId, "generous-donor"))) {
      achievements.push({
        id: "generous-donor",
        name: "Generous Donor",
        description: "Made 5 medicine donations",
        icon: "💊",
        unlockedAt: new Date(),
        category: "milestone",
      })
    }

    if (donations >= 20 && !(await this.hasAchievement(userId, "super-donor"))) {
      achievements.push({
        id: "super-donor",
        name: "Super Donor",
        description: "Made 20 medicine donations",
        icon: "⭐",
        unlockedAt: new Date(),
        category: "milestone",
      })
    }

    // Save new achievements
    if (achievements.length > 0) {
      await this.saveAchievements(userId, achievements)
    }

    return achievements
  }

  private static async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const user = await User.findById(userId)
    return user?.achievements?.some((a: any) => a.id === achievementId) || false
  }

  private static async saveAchievements(userId: string, achievements: UserAchievement[]): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $push: { achievements: { $each: achievements } },
    })
  }

  static async getLeaderboard(limit = 10): Promise<
    Array<{
      user: { id: string; name: string }
      impact: SustainabilityMetrics
      rank: number
    }>
  > {
    await dbConnect()

    const users = await User.find({ role: { $ne: "admin" } }).select("_id name")
    const leaderboard = []

    for (const user of users) {
      const impact = await this.calculateUserImpact(user._id.toString())
      leaderboard.push({
        user: { id: user._id.toString(), name: user.name },
        impact,
        score: impact.co2Saved + impact.wasteReduced * 10, // Weighted score
      })
    }

    // Sort by score and add ranks
    leaderboard.sort((a, b) => b.score - a.score)

    return leaderboard.slice(0, limit).map((entry, index) => ({
      user: entry.user,
      impact: entry.impact,
      rank: index + 1,
    }))
  }
}
