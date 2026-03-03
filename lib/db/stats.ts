import { getDb } from "@/lib/mongodb"

export interface Stats {
  totalDonations: number
  totalVolunteers: number
  totalMedicines: number
  pendingDonations: number
  approvedDonations: number
  distributedDonations: number
  activeVolunteers: number
  recentDonations: Array<{
    donorName: string
    medicineName: string
    quantity: number
    status: string
    createdAt: Date
  }>
}

export async function getStats(): Promise<Stats> {
  const db = await getDb()

  const [
    totalDonations,
    totalVolunteers,
    totalMedicines,
    pendingDonations,
    approvedDonations,
    distributedDonations,
    activeVolunteers,
    recentDonations,
  ] = await Promise.all([
    db.collection("donations").countDocuments(),
    db.collection("volunteers").countDocuments(),
    db.collection("medicines").countDocuments({ status: "available" }),
    db.collection("donations").countDocuments({ status: "pending" }),
    db.collection("donations").countDocuments({ status: "approved" }),
    db.collection("donations").countDocuments({ status: "distributed" }),
    db.collection("volunteers").countDocuments({ status: { $in: ["approved", "active"] } }),
    db.collection("donations")
      .find({}, { projection: { donorName: 1, medicineName: 1, quantity: 1, status: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray(),
  ])

  return {
    totalDonations,
    totalVolunteers,
    totalMedicines,
    pendingDonations,
    approvedDonations,
    distributedDonations,
    activeVolunteers,
    recentDonations: recentDonations.map((d) => ({
      donorName: d.donorName || "Anonymous",
      medicineName: d.medicineName || "Unknown",
      quantity: d.quantity || 0,
      status: d.status || "pending",
      createdAt: d.createdAt,
    })),
  }
}
