import { NextResponse } from "next/server"
import { submitDonation, getDonations, getUserDonations } from "@/lib/db/donations"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      donorName,
      donorEmail,
      donorPhone,
      medicineName,
      medicineType,
      quantity,
      expiryDate,
      batchNumber,
      manufacturer,
      notes,
      imageUrls,
    } = body

    if (!donorName || !donorEmail || !medicineName || !medicineType || !quantity || !expiryDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const donation = await submitDonation({
      donorName,
      donorEmail,
      donorPhone: donorPhone || "",
      medicineName,
      medicineType,
      quantity: Number(quantity),
      expiryDate,
      batchNumber: batchNumber || "",
      manufacturer: manufacturer || "",
      notes: notes || "",
      imageUrls: imageUrls || [],
    })

    return NextResponse.json({ success: true, donation }, { status: 201 })
  } catch (error) {
    console.error("Error submitting donation:", error)
    return NextResponse.json(
      { error: "Failed to submit donation" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const limit = Number(searchParams.get("limit") || "50")

    const donations = email
      ? await getUserDonations(email)
      : await getDonations(limit)

    return NextResponse.json({ donations })
  } catch (error) {
    console.error("Error fetching donations:", error)
    return NextResponse.json(
      { error: "Failed to fetch donations" },
      { status: 500 }
    )
  }
}
