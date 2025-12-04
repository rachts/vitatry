import mongoose from "mongoose"

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set - database features will be unavailable")
}

const cached = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not configured")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log("MongoDB connected successfully")
        return m
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export async function isConnected(): Promise<boolean> {
  return mongoose.connection.readyState === 1
}
