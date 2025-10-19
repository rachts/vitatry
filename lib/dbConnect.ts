import mongoose from "mongoose"

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

let cached = global.mongooseCache

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null }
}

export default async function dbConnect() {
  try {
    if (cached.conn) {
      console.log("Using cached MongoDB connection")
      return cached.conn
    }

    if (!cached.promise) {
      const MONGODB_URI = process.env.MONGODB_URI

      if (!MONGODB_URI) {
        throw new Error("MONGODB_URI environment variable not set")
      }

      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      }

      console.log("Creating new MongoDB connection...")
      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((m) => {
          console.log("MongoDB connected successfully")
          return m
        })
        .catch((err) => {
          console.error("MongoDB connection error:", err.message)
          cached.promise = null
          throw err
        })
    }

    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    console.error("dbConnect error:", error)
    throw error
  }
}
