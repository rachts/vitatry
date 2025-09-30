import { createMocks } from "node-mocks-http"
import handler from "@/app/api/v1/donations/route"

describe("/api/v1/donations", () => {
  it("creates a donation successfully", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        medicines: [
          {
            name: "Paracetamol",
            quantity: 10,
            expiryDate: "2025-12-31",
          },
        ],
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.message).toBe("Donation submitted successfully")
  })

  it("returns 400 for missing required fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        firstName: "John",
        // Missing lastName, email, medicines
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
  })
})
