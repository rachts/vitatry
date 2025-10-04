import mongoose from "mongoose"

async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://localhost:27017/mydatabase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB")

    const stats = await mongoose.connection.db?.stats()
    if (stats) {
      console.log("MongoDB stats:", stats)
    }

    // /** rest of code here **/
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
  }
}

export default connectToDatabase
