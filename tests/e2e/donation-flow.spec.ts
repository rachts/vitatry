import { test, expect } from "@playwright/test"

test.describe("Donation Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto("/auth/signin")
    await page.fill('[name="email"]', "test@example.com")
    await page.fill('[name="password"]', "password123")
    await page.click('button[type="submit"]')
    await page.waitForURL("/dashboard")
  })

  test("complete donation submission", async ({ page }) => {
    await page.goto("/donate")

    // Fill out donation form
    await page.fill('[name="firstName"]', "John")
    await page.fill('[name="lastName"]', "Doe")
    await page.fill('[name="email"]', "john@example.com")
    await page.fill('[name="phone"]', "+1234567890")
    await page.fill('[name="address"]', "123 Main St, City, State")
    await page.fill('[name="medicines"]', "Paracetamol - 10 tablets - Expires 2025-12-31")

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator("text=Thank you for your donation")).toBeVisible()

    // Verify redirect to dashboard
    await page.waitForURL("/dashboard")

    // Verify donation appears in history
    await expect(page.locator("text=Donation #")).toBeVisible()
  })

  test("form validation works correctly", async ({ page }) => {
    await page.goto("/donate")

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check for validation errors
    await expect(page.locator("text=This field is required")).toBeVisible()
  })
})
