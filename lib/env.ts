const requiredEnvVars = ["MONGODB_URI", "NEXTAUTH_SECRET"] as const

const optionalEnvVars = [
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "ALLOWED_ORIGINS",
] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]
type OptionalEnvVar = (typeof optionalEnvVars)[number]

function validateEnv(): void {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}

export function getEnv(key: RequiredEnvVar): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

export function getOptionalEnv(key: OptionalEnvVar, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

// Validate on import in production
if (typeof window === "undefined") {
  validateEnv()
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
}
