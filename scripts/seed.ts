import dbConnect from "../lib/dbConnect"
import Donation from "../models/Donation"
import VolunteerApplication from "../models/VolunteerApplication"

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...")
    await dbConnect()

    // Clear existing data
    await Donation.deleteMany({})
    await VolunteerApplication.deleteMany({})
    console.log("🗑️ Cleared existing data")

    // Seed sample donations
    const sampleDonations = [
      {
        name: "Paracetamol",
        brand: "Crocin",
        expiryDate: new Date("2025-12-31"),
        quantity: 50,
        conditionNotes: "Unopened box, stored in cool place",
        pickupAddress: "123 Main St, Mumbai, Maharashtra",
        donorName: "John Doe",
        donorEmail: "john@example.com",
        donorPhone: "+91 98765 43210",
        status: "submitted",
      },
      {
        name: "Vitamin D3",
        brand: "HealthKart",
        expiryDate: new Date("2025-10-15"),
        quantity: 30,
        conditionNotes: "Half pack remaining",
        pickupAddress: "456 Park Ave, Delhi, India",
        donorName: "Jane Smith",
        donorEmail: "jane@example.com",
        donorPhone: "+91 87654 32109",
        status: "verified",
      },
      {
        name: "Insulin",
        brand: "Lantus",
        expiryDate: new Date("2025-08-20"),
        quantity: 5,
        conditionNotes: "Refrigerated storage, unused vials",
        pickupAddress: "789 Health St, Bangalore, Karnataka",
        donorName: "Dr. Rajesh Kumar",
        donorEmail: "rajesh@example.com",
        donorPhone: "+91 76543 21098",
        status: "distributed",
      },
    ]

    const createdDonations = await Donation.insertMany(sampleDonations)
    console.log(`✅ Created ${createdDonations.length} sample donations`)

    // Seed sample volunteer applications
    const sampleApplications = [
      {
        fullName: "Alice Johnson",
        email: "alice@example.com",
        phone: "+91 65432 10987",
        location: "Mumbai, Maharashtra",
        availability: ["Weekdays (9 AM - 5 PM)", "Weekends (9 AM - 5 PM)"],
        skills: ["Medical/Healthcare Background", "Communication/Outreach"],
        experience: "5 years as a registered nurse",
        motivation: "Want to help reduce medicine waste and help underprivileged communities",
        role: "verifier",
        status: "approved",
      },
      {
        fullName: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "+91 54321 09876",
        location: "Delhi, India",
        availability: ["Evenings (5 PM - 9 PM)", "Flexible/On-call"],
        skills: ["Transportation/Driving", "Data Entry/Admin"],
        experience: "Volunteer driver for local NGOs",
        motivation: "Passionate about community service and healthcare access",
        role: "pickup_delivery",
        status: "under_review",
      },
    ]

    const createdApplications = await VolunteerApplication.insertMany(sampleApplications)
    console.log(`✅ Created ${createdApplications.length} sample volunteer applications`)

    console.log("🎉 Database seeded successfully!")

    // Print summary
    const donationCount = await Donation.countDocuments()
    const applicationCount = await VolunteerApplication.countDocuments()

    console.log(`📊 Database Summary:`)
    console.log(`   - Donations: ${donationCount}`)
    console.log(`   - Volunteer Applications: ${applicationCount}`)
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding complete")
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error)
      process.exit(1)
    })
}

export default seedDatabase
