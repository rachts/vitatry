/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
import { NextResponse } from "next/server"

export type ApiJson<T = any> = { success: boolean; data?: T; error?: string }

function json<T>(data: ApiJson<T>, status = 200) {
  return NextResponse.json(data, { status })
}

export const api = {
  ok<T>(data: T) {
    return json<T>({ success: true, data }, 200)
  },
  created<T>(data: T) {
    return json<T>({ success: true, data }, 201)
  },
  badRequest(message = "Bad request") {
    return json({ success: false, error: message }, 400)
  },
  unauthorized(message = "Unauthorized") {
    return json({ success: false, error: message }, 401)
  },
  forbidden(message = "Forbidden") {
    return json({ success: false, error: message }, 403)
  },
  notFound(message = "Not found") {
    return json({ success: false, error: message }, 404)
  },
  error(message = "Internal server error", status = 500) {
    return json({ success: false, error: message }, status)
  },
}
