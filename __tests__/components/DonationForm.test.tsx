import { render, screen, fireEvent, waitFor } from "../utils/test-utils"
import DonationForm from "@/app/donate/donation-form"

// Mock fetch
global.fetch = jest.fn()

describe("DonationForm", () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it("renders donation form correctly", () => {
    render(<DonationForm />)

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /submit donation/i })).toBeInTheDocument()
  })

  it("submits form with valid data", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "123", message: "Success" }),
    })

    render(<DonationForm />)

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    })

    fireEvent.click(screen.getByRole("button", { name: /submit donation/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/donate", expect.any(Object))
    })
  })

  it("shows error message on submission failure", async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Submission failed" }),
    })

    render(<DonationForm />)

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    })

    fireEvent.click(screen.getByRole("button", { name: /submit donation/i }))

    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument()
    })
  })
})
