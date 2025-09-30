interface FetchOptions extends RequestInit {
  timeout?: number
}

class FetchError extends Error {
  status: number
  statusText: string

  constructor(message: string, status: number, statusText: string) {
    super(message)
    this.name = "FetchError"
    this.status = status
    this.statusText = statusText
  }
}

export async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new FetchError(`HTTP error! status: ${response.status}`, response.status, response.statusText)
    }

    return response
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout")
    }

    throw error
  }
}

export async function apiRequest<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetchWithTimeout(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()
  return data
}

export const api = {
  get: <T = any>(url: string, options?: FetchOptions) => apiRequest<T>(url, { method: "GET", ...options }),

  post: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiRequest<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  put: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  patch: <T = any>(url: string, data?: any, options?: FetchOptions) =>
    apiRequest<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  delete: <T = any>(url: string, options?: FetchOptions) => apiRequest<T>(url, { method: "DELETE", ...options }),
}
