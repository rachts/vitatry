export interface VitaMendConfig {
  apiKey: string
  baseUrl?: string
}

export interface DonationInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  medicines: Array<{
    name: string
    quantity: number
    expiryDate: string | Date
    batchNumber?: string
    manufacturer?: string
  }>
  images?: string[]
}

export interface VolunteerInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  interest?: string
  availability?: string
  experience?: string
  motivation?: string
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface DonationFilter {
  status?: "pending" | "verified" | "rejected" | "collected" | "distributed"
}

export class VitaMendSDK {
  private apiKey: string
  private baseUrl: string

  constructor(config: VitaMendConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://vitamend.com/api/v1"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "API request failed")
    }

    return await response.json()
  }

  // Donation methods
  async createDonation(donation: DonationInput): Promise<{ id: string }> {
    return this.request("/donations", {
      method: "POST",
      body: JSON.stringify(donation),
    })
  }

  async getDonations(options?: PaginationOptions & DonationFilter): Promise<{
    donations: any[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const queryParams = new URLSearchParams()

    if (options?.page) queryParams.append("page", options.page.toString())
    if (options?.limit) queryParams.append("limit", options.limit.toString())
    if (options?.status) queryParams.append("status", options.status)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return this.request(`/donations${queryString}`, {
      method: "GET",
    })
  }

  async getDonation(id: string): Promise<any> {
    return this.request(`/donations/${id}`, {
      method: "GET",
    })
  }

  async updateDonationStatus(id: string, status: string, notes?: string): Promise<any> {
    return this.request(`/donations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    })
  }

  // Volunteer methods
  async createVolunteerApplication(volunteer: VolunteerInput): Promise<{ id: string }> {
    return this.request("/volunteers", {
      method: "POST",
      body: JSON.stringify(volunteer),
    })
  }

  async getVolunteers(options?: PaginationOptions): Promise<{
    volunteers: any[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const queryParams = new URLSearchParams()

    if (options?.page) queryParams.append("page", options.page.toString())
    if (options?.limit) queryParams.append("limit", options.limit.toString())

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return this.request(`/volunteers${queryString}`, {
      method: "GET",
    })
  }

  // Analytics methods
  async getStats(): Promise<{
    totalDonations: number
    totalVolunteers: number
    medicinesDistributed: number
    livesImpacted: number
    impactMetrics: {
      co2Saved: number
      wasteReduced: number
      communitiesServed: number
    }
  }> {
    return this.request("/stats", {
      method: "GET",
    })
  }

  // GraphQL API (for more complex queries)
  async graphql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    return this.request("/graphql", {
      method: "POST",
      body: JSON.stringify({
        query,
        variables,
      }),
    })
  }
}

// Example usage:
// const vitamend = new VitaMendSDK({ apiKey: 'your-api-key' })
// const donation = await vitamend.createDonation({...})
