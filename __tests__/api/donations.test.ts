import { POST, GET } from "@/app/api/v1/donations/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: { id: "test-user-id", email: "test@example.com", role: "donor", name: "Test User" },
    }),
  ),
}))

// Mock dbConnect
jest.mock("@/lib/dbConnect", () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}))

// Mock Donation model
jest.mock("@/models/Donation", () => ({
  __esModule: true,
  default: {
    create: jest.fn((data) =>
      Promise.resolve({
        _id: "mock-donation-id",
        donationId: data.donationId,
        ...data,
        toObject: () => ({ _id: "mock-donation-id", ...data }),
      }),
    ),
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        skip: jest.fn(() => ({
          limit: jest.fn(() => ({
            lean: jest.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    countDocuments: jest.fn(() => Promise.resolve(0)),
  },
}))

function createMockRequest(method: string, body?: object, searchParams?: Record<string, string>): NextRequest {
  const url = new URL("http://localhost:3000/api/v1/donations")
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return new NextRequest(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe("/api/v1/donations", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("POST", () => {
    it("creates a donation successfully", async () => {
      const req = createMockRequest("POST", {
        medicineName: "Paracetamol",
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        brand: "Generic",
        dosage: "500mg",
        quantity: 10,
        expiryDate: "2025-12-31",
        condition: "unopened",
        category: "pain-relief",
        donorPhone: "1234567890",
        donorAddress: "123 Test St",
      })

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.message).toBe("Donation submitted successfully")
    })

    it("returns 400 for missing required fields", async () => {
      const req = createMockRequest("POST", {
        firstName: "John",
        // Missing medicineName and email
      })

      const response = await POST(req)

      expect(response.status).toBe(400)
    })
  })

  describe("GET", () => {
    it("returns donations list", async () => {
      const req = createMockRequest("GET", undefined, { page: "1", limit: "10" })

      const response = await GET(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.donations)).toBe(true)
    })
  })
})
