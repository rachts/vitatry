import type { Mongoose } from "mongoose"

declare global {
  var mongoose: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  }
  var mongooseCache: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  }
}

// NextAuth session extension
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
  }
}
