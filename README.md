# Vitamend

**Medicine donation + redistribution platform**

Created by: **Rachit Kumar Tiwari**

---

## Overview

Vitamend connects medicine donors with people in need via verified NGO partners. Our AI-powered verification system ensures safety and authenticity of donated medicines.

## Features

- 🏥 **Medicine Donation**: Upload photos of unused medicines
- 🤖 **AI Verification**: Automated safety and authenticity checks
- 🤝 **NGO Network**: Trusted partner organizations
- 📊 **Impact Tracking**: See how your donations help communities
- 🛒 **Shop**: Purchase verified medicines at subsidized prices (₹10-₹200)
- 👥 **Volunteer Program**: Join our community of helpers

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **AI/ML**: Custom OCR and verification service (FastAPI)
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB database
- Python 3.9+ (for OCR service)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/vitamend.git
   cd vitamend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
   - Other optional variables as needed

4. **Run database seed** (optional)
   \`\`\`bash
   npm run seed
   \`\`\`

5. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### OCR Service Setup (Optional)

The OCR service provides medicine verification via image analysis.

1. **Navigate to OCR service directory**
   \`\`\`bash
   cd ocr-service
   \`\`\`

2. **Create virtual environment**
   \`\`\`bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Configure environment**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit `.env` and set `MONGO_URI`, `TESSERACT_CMD`, etc.

5. **Run the service**
   \`\`\`bash
   uvicorn app.main:app --reload
   \`\`\`

## Deployment to Vercel

1. **Push code to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Add environment variables**
   In Vercel project settings, add all variables from `.env.example`:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `BLOB_READ_WRITE_TOKEN` (if using Vercel Blob)
   - Other optional variables

4. **Deploy**
   Vercel will automatically deploy on every push to `main`

## Project Structure

\`\`\`
vitamend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # Page components
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility functions
├── models/                # MongoDB models
├── public/                # Static assets
├── ocr-service/          # Python OCR microservice
└── scripts/              # Database seeds and utilities
\`\`\`

## API Endpoints

### Public
- `GET /api/shop/products` - List verified medicines
- `GET /api/founders` - Get founder information
- `POST /api/volunteer` - Submit volunteer application

### Authenticated
- `POST /api/donations` - Create donation
- `GET /api/donations` - List user's donations
- `GET /api/users/me` - Get current user

### Admin
- `GET /api/admin/medicines` - List pending medicines
- `PUT /api/admin/medicines` - Verify/reject medicine
- `GET /api/admin/volunteers` - List volunteers

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@vitamend.com

---

**Built with ❤️ by Rachit Kumar Tiwari**
