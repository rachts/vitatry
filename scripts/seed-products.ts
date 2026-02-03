import dbConnect from "@/lib/dbConnect"
import Product from "@/models/Product"

const sampleProducts: any[] = []

export async function seedProducts() {
  try {
    await dbConnect()

    // Clear existing products - start fresh with no dummy data
    await Product.deleteMany({})
    console.log("Cleared all products - platform starts clean")

    return []
  } catch (error) {
    console.error("Error clearing products:", error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log("Product cleanup completed - no dummy data")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Product cleanup failed:", error)
      process.exit(1)
    })
}
