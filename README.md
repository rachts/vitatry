/**
 * Project: Vitamend
 * Creator: Rachit Kumar Tiwari
 */
# Vitamend

Medicine donation and redistribution platform focused on social impact and affordability.

## Creator
Rachit Kumar Tiwari

## Features
- Donate medicines with verification workflow
- Browse affordable medicines (₹10–₹200)
- Volunteer sign-up with duplicate-email guard
- Admin verification for donations and volunteer list
- Consistent API responses and CORS
- Simple rate limiting

## Environment
- MONGODB_URI
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- ALLOWED_ORIGINS

## Scripts
- npm run dev
- npm run build
- npm start

## Setup
1. Add environment variables.
2. Start dev server: npm run dev
3. Seed data if needed.
4. Visit the app and APIs:
   - GET /api/shop/products
   - POST /api/medicines
   - GET /api/founders

## Notes
All APIs return {"success": boolean, "data"?: any, "error"?: string}. Admin-only routes under /api/admin require an authenticated admin session.
