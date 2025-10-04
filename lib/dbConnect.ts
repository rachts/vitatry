import mongoose from "mongoose"

declare global {
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vitamendorg:rachit.1@vitamend.4hji7qs.mongodb.net/?retryWrites=true&w=majority&appName=VitaMend"

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set. Add it to your .env.local.")
}

let cached = global.__mongooseCache
if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached!.conn) {
    console.log("Using cached MongoDB connection")
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }

    console.log("Connecting to MongoDB...")
    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error)
        cached!.promise = null
        throw error
      })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    console.error("MongoDB connection failed:", e)
    throw e
  }

  return cached!.conn
}
