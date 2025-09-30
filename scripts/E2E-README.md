# VitaMend Live E2E Test

This script exercises the live Donate and Volunteer flows without a browser.

What it covers:
- Reachability: /api/health and key pages.
- Volunteer: POST /api/volunteer (JSON).
- Donation (optional): POST /api/donations (FormData) and GET /api/donations when you supply an authenticated cookie.

Prerequisites:
1. Deployed site URL set in `.env.local` as LIVE_BASE_URL.
2. For donation API tests, your session cookie in `.env.local` as COOKIE_HEADER.

How to run:
1. Ensure Node.js 18+ is installed.
2. Set LIVE_BASE_URL and COOKIE_HEADER in .env.local:
   LIVE_BASE_URL="https://your-app.vercel.app"
   COOKIE_HEADER="next-auth.session-token=...; other=cookies"
3. Run:
   node --env-file=.env.local scripts/e2e-live-test.ts

Notes:
- COOKIE_HEADER is only needed for donation endpoints that require authentication.
- To get your cookie: log in to the live site, open DevTools → Network → any API call → Request Headers → copy the `cookie` header.
- Check MongoDB to confirm documents created:
  - Volunteer: collection `volunteerapplications`
  - Donations: collection `donations`

Troubleshooting:
- 401 Unauthorized for donations: verify COOKIE_HEADER and that it includes the session token name used by NextAuth.
- 404: confirm your LIVE_BASE_URL, and that the deployment is finished.
- CORS: the script talks to your live site from Node; standard Next.js API routes allow same-origin by default. If you added custom headers, ensure they allow this request.
