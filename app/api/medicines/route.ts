import { NextResponse } from "next/server"
import { getMedicines } from "@/lib/db/medicines"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit") || "50")

    const medicines = await getMedicines(limit)

    const serialized = medicines.map((m) => ({
      id: m._id?.toString(),
      name: m.name,
      type: m.type,
      quantity: m.quantity,
      expiryDate: m.expiryDate,
      batchNumber: m.batchNumber,
      manufacturer: m.manufacturer,
      description: m.description,
      imageUrls: m.imageUrls,
      verified: m.verified,
      status: m.status,
      createdAt: m.createdAt,
    }))

    return NextResponse.json({ medicines: serialized })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    )
  }
}
