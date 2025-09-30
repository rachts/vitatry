import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

const sampleProducts = [
  {
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 12.99,
    originalPrice: 18.99,
    inStock: 150,
    description: "Effective pain relief and fever reducer. Safe for adults and children over 12 years.",
    image: "/paracetamol-tablets.png",
    expiryDate: new Date("2025-12-31"),
    manufacturer: "PharmaCorp",
    verified: true,
    batchNumber: "PC2024001",
    dosage: "500mg",
    form: "tablet",
    prescriptionRequired: false,
    activeIngredients: ["Paracetamol"],
    sideEffects: ["Nausea", "Skin rash (rare)"],
    storageInstructions: "Store in a cool, dry place below 25°C",
    rating: 4.5,
    reviewCount: 128,
    tags: ["pain relief", "fever", "headache"],
  },
  {
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    price: 24.99,
    originalPrice: 32.99,
    inStock: 89,
    description: "Broad-spectrum antibiotic for bacterial infections. Prescription required.",
    image: "/placeholder.svg?height=200&width=300&text=Amoxicillin",
    expiryDate: new Date("2025-08-15"),
    manufacturer: "MediLabs",
    verified: true,
    batchNumber: "ML2024002",
    dosage: "250mg",
    form: "capsule",
    prescriptionRequired: true,
    activeIngredients: ["Amoxicillin"],
    sideEffects: ["Diarrhea", "Nausea", "Allergic reactions"],
    contraindications: ["Penicillin allergy"],
    storageInstructions: "Store in refrigerator between 2-8°C",
    rating: 4.2,
    reviewCount: 67,
    tags: ["antibiotic", "infection", "bacterial"],
  },
  {
    name: "Vitamin D3 1000IU",
    category: "Vitamins",
    price: 16.99,
    inStock: 200,
    description: "Essential vitamin for bone health and immunity. Supports calcium absorption.",
    image: "/vitamin-d-tablets.png",
    expiryDate: new Date("2026-03-20"),
    manufacturer: "VitaHealth",
    verified: true,
    batchNumber: "VH2024003",
    dosage: "1000IU",
    form: "tablet",
    prescriptionRequired: false,
    activeIngredients: ["Cholecalciferol"],
    sideEffects: ["Constipation (rare)", "Kidney stones (with overdose)"],
    storageInstructions: "Store in a cool, dry place away from light",
    rating: 4.7,
    reviewCount: 203,
    tags: ["vitamin", "bone health", "immunity"],
  },
  {
    name: "Insulin Glargine",
    category: "Diabetes",
    price: 89.99,
    originalPrice: 120.0,
    inStock: 45,
    description: "Long-acting insulin for diabetes management. Provides 24-hour glucose control.",
    image: "/insulin-pen.png",
    expiryDate: new Date("2025-06-30"),
    manufacturer: "DiabetesCare",
    verified: true,
    batchNumber: "DC2024004",
    dosage: "100 units/mL",
    form: "injection",
    prescriptionRequired: true,
    activeIngredients: ["Insulin Glargine"],
    sideEffects: ["Hypoglycemia", "Injection site reactions"],
    contraindications: ["Hypoglycemia", "Ketoacidosis"],
    storageInstructions: "Store in refrigerator. Do not freeze.",
    rating: 4.8,
    reviewCount: 89,
    tags: ["diabetes", "insulin", "glucose control"],
  },
  {
    name: "Omeprazole 20mg",
    category: "Digestive",
    price: 19.99,
    originalPrice: 25.99,
    inStock: 120,
    description: "Proton pump inhibitor for acid reflux and stomach ulcers.",
    image: "/placeholder.svg?height=200&width=300&text=Omeprazole",
    expiryDate: new Date("2025-11-15"),
    manufacturer: "GastroMed",
    verified: true,
    batchNumber: "GM2024005",
    dosage: "20mg",
    form: "capsule",
    prescriptionRequired: false,
    activeIngredients: ["Omeprazole"],
    sideEffects: ["Headache", "Diarrhea", "Abdominal pain"],
    storageInstructions: "Store below 25°C in original container",
    rating: 4.3,
    reviewCount: 156,
    tags: ["acid reflux", "stomach", "ulcer"],
  },
  {
    name: "Cetirizine 10mg",
    category: "Respiratory",
    price: 8.99,
    inStock: 180,
    description: "Antihistamine for allergies, hay fever, and hives.",
    image: "/placeholder.svg?height=200&width=300&text=Cetirizine",
    expiryDate: new Date("2025-09-30"),
    manufacturer: "AllergyRelief",
    verified: true,
    batchNumber: "AR2024006",
    dosage: "10mg",
    form: "tablet",
    prescriptionRequired: false,
    activeIngredients: ["Cetirizine Hydrochloride"],
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    storageInstructions: "Store at room temperature",
    rating: 4.4,
    reviewCount: 92,
    tags: ["allergy", "antihistamine", "hay fever"],
  },
  {
    name: "Metformin 500mg",
    category: "Diabetes",
    price: 15.99,
    inStock: 95,
    description: "First-line treatment for type 2 diabetes. Helps control blood sugar.",
    image: "/placeholder.svg?height=200&width=300&text=Metformin",
    expiryDate: new Date("2025-07-20"),
    manufacturer: "DiabetesCare",
    verified: true,
    batchNumber: "DC2024007",
    dosage: "500mg",
    form: "tablet",
    prescriptionRequired: true,
    activeIngredients: ["Metformin Hydrochloride"],
    sideEffects: ["Nausea", "Diarrhea", "Metallic taste"],
    contraindications: ["Kidney disease", "Liver disease"],
    storageInstructions: "Store at room temperature",
    rating: 4.1,
    reviewCount: 134,
    tags: ["diabetes", "blood sugar", "type 2"],
  },
  {
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    price: 9.99,
    originalPrice: 14.99,
    inStock: 220,
    description: "Non-steroidal anti-inflammatory drug for pain and inflammation.",
    image: "/placeholder.svg?height=200&width=300&text=Ibuprofen",
    expiryDate: new Date("2025-10-31"),
    manufacturer: "PharmaCorp",
    verified: true,
    batchNumber: "PC2024008",
    dosage: "400mg",
    form: "tablet",
    prescriptionRequired: false,
    activeIngredients: ["Ibuprofen"],
    sideEffects: ["Stomach upset", "Dizziness", "Headache"],
    contraindications: ["Stomach ulcers", "Kidney disease"],
    storageInstructions: "Store below 25°C",
    rating: 4.6,
    reviewCount: 187,
    tags: ["pain relief", "anti-inflammatory", "fever"],
  },
]

export async function seedProducts() {
  try {
    await dbConnect()

    // Clear existing products
    await Product.deleteMany({})
    console.log("Cleared existing products")

    // Insert sample products
    const products = await Product.insertMany(sampleProducts)
    console.log(`Inserted ${products.length} sample products`)

    return products
  } catch (error) {
    console.error("Error seeding products:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log("Product seeding completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Product seeding failed:", error)
      process.exit(1)
    })
}
