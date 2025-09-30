import dbConnect from "../lib/dbConnect"
import Donation from "../models/Donation"

async function testDonation() {
  try {
    console.log("🔌 Connecting to MongoDB...")
    await dbConnect()
    console.log("✅ Connected to MongoDB successfully!")

    // Create a test donation
    const testDonation = {
      donationId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      medicineName: "Paracetamol 500mg",
      brand: "Crocin",
      genericName: "Acetaminophen",
      dosage: "500mg",
      quantity: 20,
      expiryDate: new Date("2025-12-31"),
      condition: "new" as const,
      category: "pain_relief" as const,
      donorName: "Test User",
      donorEmail: "test@example.com",
      donorPhone: "+1234567890",
      donorAddress: "123 Test Street, Test City, TC 12345",
      notes: "Test donation for MongoDB verification",
      images: [],
      status: "pending" as const,
      isReserved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log("💾 Creating test donation...")
    const donation = new Donation(testDonation)
    const savedDonation = await donation.save()

    console.log("✅ Test donation created successfully!")
    console.log("📋 Donation ID:", savedDonation.donationId)
    console.log("🆔 MongoDB _id:", savedDonation._id)

    // Verify the donation was saved
    console.log("🔍 Verifying donation in database...")
    const foundDonation = await Donation.findById(savedDonation._id)

    if (foundDonation) {
      console.log("✅ Donation verified in database!")
      console.log("📊 Total donations in database:", await Donation.countDocuments())
    } else {
      console.log("❌ Donation not found in database!")
    }

    // Test fetching donations
    console.log("📋 Fetching recent donations...")
    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(5).lean()

    console.log(`📊 Found ${recentDonations.length} recent donations:`)
    recentDonations.forEach((donation, index) => {
      console.log(`  ${index + 1}. ${donation.donationId} - ${donation.medicineName} (${donation.status})`)
    })

    console.log("🎉 MongoDB test completed successfully!")
  } catch (error) {
    console.error("❌ MongoDB test failed:", error)

    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    process.exit(1)
  }

  process.exit(0)
}

// Run the test
testDonation()
