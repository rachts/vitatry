import { NextResponse } from "next/server"

export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export function validateRequired(data: Record<string, any>, fields: string[]) {
  const missing = fields.filter((field) => !data[field])

  if (missing.length > 0) {
    throw new ApiError(`Missing required fields: ${missing.join(", ")}`, 400)
  }
}
