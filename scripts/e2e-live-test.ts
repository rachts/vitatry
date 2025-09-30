/**
 * End-to-end live test for VitaMend Donate and Volunteer flows.
 *
 * What it does:
 * 1) Pings /api/health and a few pages to ensure the site is reachable.
 * 2) Submits a Volunteer application (JSON -> /api/volunteer) and verifies success.
 * 3) Optionally submits a Donation (FormData -> /api/donations) if COOKIE_HEADER is provided.
 * 4) Attempts to fetch donations (GET /api/donations) if COOKIE_HEADER is provided.
 *
 * How to run:
 * 1) Ensure LIVE_BASE_URL is set in .env.local (e.g., https://vitamend.vercel.app).
 * 2) Optionally set COOKIE_HEADER with your session cookie to test authenticated donation endpoints.
 * 3) From the project root, run:
 *      node --env-file=.env.local scripts/e2e-live-test.ts
 *
 * Tip: Get COOKIE_HEADER by logging in on your live site, then copy the cookie header from DevTools > Network
 * for any API call (Request Headers > cookie). Paste it into .env.local as COOKIE_HEADER.
 */

type Json = Record<string, any>

const LIVE_BASE_URL = process.env.LIVE_BASE_URL || "http://localhost:3000"
const COOKIE_HEADER = process.env.COOKIE_HEADER || ""

function logStep(title: string) {
  console.log(`\n==> ${title}`)
}

async function fetchJSON(path: string, init: RequestInit = {}, expectOk = true) {
  const res = await fetch(`${LIVE_BASE_URL}${path}`, init)
  const text = await res.text()
  let json: Json | null = null
  try {
    json = JSON.parse(text)
  } catch {
    // non-JSON response
  }
  if (expectOk && !res.ok) {
    throw new Error(`Request failed ${path} ${res.status}: ${text}`)
  }
  return { res, json, text }
}

async function run() {
  console.log(`Running E2E against: ${LIVE_BASE_URL}`)
  if (COOKIE_HEADER) {
    console.log("Auth: COOKIE_HEADER is set (Donation API tests will run)")
  } else {
    console.log("Auth: COOKIE_HEADER not set (Donation API tests will be skipped)")
  }

  // 1) Healthcheck and pages
  logStep("Healthcheck and key pages")
  {
    const health = await fetch(`${LIVE_BASE_URL}/api/health`)
    console.log(`/api/health -> ${health.status}`)

    const pages = ["/", "/donate", "/volunteer"]
    for (const p of pages) {
      const r = await fetch(`${LIVE_BASE_URL}${p}`)
      console.log(`${p} -> ${r.status}`)
    }
  }

  // 2) Volunteer application (JSON)
  logStep("Submit Volunteer application (JSON)")
  {
    const body = {
      firstName: "Test",
      lastName: "Volunteer",
      email: `test.volunteer+${Date.now()}@example.com`,
      phone: "+910000000000",
      location: "Test City",
      interest: "verification, pickup",
      availability: "Weekends",
      experience: "Some experience helping NGOs",
      motivation: "I want to help people get access to medicines.",
    }

    const { res, json, text } = await fetchJSON("/api/volunteer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    console.log(`Volunteer POST -> ${res.status} ${res.statusText}`)
    console.log("Response:", json ?? text)
  }

  // 3) Donation submission (multipart) – requires auth cookie
  if (COOKIE_HEADER) {
    logStep("Submit Donation (FormData) - requires authenticated session cookie")
    const fd = new FormData()
    fd.append("medicineName", "Paracetamol 500mg")
    fd.append("quantity", "10")
    fd.append("unit", "tablets")
    fd.append("expiryDate", new Date(Date.now() + 200 * 24 * 3600 * 1000).toISOString().slice(0, 10)) // ~6+ months
    fd.append("manufacturer", "Test Pharma")
    fd.append("batchNumber", "BATCH123")
    fd.append("description", "Donated via E2E script")
    fd.append("address", "123 Test Street, Test City")
    fd.append("phone", "+910000000001")
    fd.append("preferredTime", "Evenings")

    // Optional: attach a tiny dummy file (not required)
    // const blob = new Blob(["dummy"], { type: "text/plain" })
    // fd.append("image_0", blob, "note.txt")

    const donationRes = await fetch(`${LIVE_BASE_URL}/api/donations`, {
      method: "POST",
      body: fd,
      headers: { cookie: COOKIE_HEADER },
    })

    const donationText = await donationRes.text()
    let donationJson: Json | null = null
    try {
      donationJson = JSON.parse(donationText)
    } catch {}
    console.log(`Donation POST -> ${donationRes.status} ${donationRes.statusText}`)
    console.log("Response:", donationJson ?? donationText)

    // 4) Fetch recent donations
    logStep("Fetch Donations (GET) - requires authenticated session cookie")
    const listRes = await fetch(`${LIVE_BASE_URL}/api/donations?limit=5`, {
      headers: { cookie: COOKIE_HEADER },
    })
    const listText = await listRes.text()
    let listJson: Json | null = null
    try {
      listJson = JSON.parse(listText)
    } catch {}
    console.log(`Donations GET -> ${listRes.status} ${listRes.statusText}`)
    console.log("Response:", (listJson ?? listText))
  } else {
    logStep("Skipping Donation tests (no COOKIE_HEADER provided)")
  }

  console.log("\nE2E Live Test completed.")
}

run().catch((err) => {
  console.error("E2E Live Test failed:", err)
  process.exit(1)
})
