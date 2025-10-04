import mongoose from "mongoose"

declare global {
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://vitamendorg:rachit.1@vitamend.4hji7qs.mongodb.net/?retryWrites=true&w=majority&appName=VitaMend"

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables")
}

let cached = global.__mongooseCache

if (!cached) {
  cached = global.__mongooseCache = { conn: null, promise: null }
}

export default async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose
      })
      .catch((error) => {
        cached!.promise = null
        throw error
      })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}
