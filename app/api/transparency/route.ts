import { type NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error"
import dbConnect from "@/lib/dbConnect"
import Donation from "@/models/Donation"
import User from "@/models/User"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get overview statistics
    const [totalDonations, verifiedMedicines, distributedMedicines, donorCount, ngoCount] = await Promise.all([
      Donation.countDocuments(),
      Donation.aggregate([
        { $match: { status: "verified" } },
        { $unwind: "$medicines" },
        { $group: { _id: null, count: { $sum: "$medicines.quantity" } } },
      ]),
      Donation.aggregate([
        { $match: { status: "distributed" } },
        { $unwind: "$medicines" },
        { $group: { _id: null, count: { $sum: "$medicines.quantity" } } },
      ]),
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "ngo_partner" }),
    ])

    // Get distribution data
    const distributionData =
      (await mongoose.models.MedicineDistribution?.aggregate([
        { $match: { status: { $in: ["approved", "shipped", "delivered"] } } },
        { $lookup: { from: "users", localField: "ngoId", foreignField: "_id", as: "ngo" } },
        { $unwind: "$ngo" },
        {
          $group: {
            _id: "$ngoId",
            organization: { $first: "$ngo.name" },
            location: { $first: "$ngo.profile.address" },
            medicinesReceived: { $sum: "$quantity" },
            lastDistribution: { $max: "$updatedAt" },
          },
        },
        {
          $project: {
            _id: 0,
            organization: 1,
            location: 1,
            medicinesReceived: 1,
            beneficiaries: { $multiply: ["$medicinesReceived", 0.1] },
            lastDistribution: 1,
          },
        },
      ])) || []

    // Get verification statistics
    const verificationStats = await Donation.aggregate([
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
    ])

    // Calculate impact metrics
    const totalMedicines = await Donation.aggregate([
      { $unwind: "$medicines" },
      { $group: { _id: null, count: { $sum: "$medicines.quantity" } } },
    ])

    const medicineCount = totalMedicines.length > 0 ? totalMedicines[0].count : 0
    const wasteReduced = medicineCount * 0.05 // 50g per medicine
    const co2Saved = wasteReduced * 1.5 // 1.5kg CO2 per kg waste

    return NextResponse.json({
      overview: {
        totalDonations,
        verifiedMedicines: verifiedMedicines.length > 0 ? verifiedMedicines[0].count : 0,
        distributedMedicines: distributedMedicines.length > 0 ? distributedMedicines[0].count : 0,
        activeBeneficiaries: Math.ceil((distributedMedicines.length > 0 ? distributedMedicines[0].count : 0) * 0.1),
        partnerOrganizations: ngoCount,
      },
      distribution: distributionData,
      verification:
        verificationStats.length > 0
          ? {
              ...verificationStats[0],
              averageProcessingTime: 24, // Placeholder - would calculate from actual timestamps
            }
          : {
              totalProcessed: 0,
              approved: 0,
              rejected: 0,
              pending: 0,
              averageProcessingTime: 0,
            },
      financials: {
        operatingCosts: 12500,
        adminPercentage: 15,
        programPercentage: 80,
        fundraisingPercentage: 5,
      },
      impact: {
        livesImpacted: Math.ceil(medicineCount * 0.1),
        communitiesServed: Math.ceil(medicineCount * 0.01),
        wasteReduced,
        co2Saved,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
