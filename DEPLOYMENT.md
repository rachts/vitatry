# Vitamend Deployment Guide

## Prerequisites

1. MongoDB Atlas account and cluster
2. Vercel account
3. Google OAuth credentials (optional)

## Environment Variables

Required environment variables for Vercel:

### Database
- `MONGODB_URI` - MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/vitamend`)

### Authentication
- `NEXTAUTH_URL` - Your production URL (e.g., `https://vitamend.vercel.app`)
- `NEXTAUTH_SECRET` - Random secret key (generate with `openssl rand -base64 32`)

### File Uploads
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

### OAuth (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Security
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

## Vercel Setup

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Go to Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Make sure to add them for Production, Preview, and Development

3. **Deploy**
   - Push to `main` branch to trigger deployment
   - Or click "Deploy" in Vercel dashboard

## MongoDB Setup

1. **Create Cluster**
   - Log in to MongoDB Atlas
   - Create a new cluster
   - Choose your preferred region

2. **Configure Network Access**
   - Add IP: `0.0.0.0/0` (allows Vercel to connect)
   - Or whitelist specific Vercel IPs

3. **Create Database User**
   - Username: `vitamend-app`
   - Password: Generate strong password
   - Role: `readWrite` on `vitamend` database

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add to Vercel as `MONGODB_URI`

## Post-Deployment

1. **Seed Database**
   - Run seed script locally or via Vercel function
   - `npm run seed`

2. **Test Endpoints**
   - `/api/health` - Health check
   - `/api/shop/products` - Products list
   - `/api/founders` - Founders info

3. **Monitor**
   - Check Vercel logs for errors
   - Monitor MongoDB Atlas metrics

## Troubleshooting

### Build Fails with "MONGODB_URI is not set"
- Ensure `MONGODB_URI` is added in Vercel environment variables
- Redeploy after adding the variable

### Import Errors
- Check that all exports match imports
- Run `npm run build` locally to catch errors before deploying

### Database Connection Issues
- Verify MongoDB connection string
- Check network access settings in MongoDB Atlas
- Ensure database user has correct permissions

## OCR Service (Optional)

If you want to deploy the FastAPI OCR service:

1. **Containerize**
   \`\`\`bash
   cd ocr-service
   docker build -t vitamend-ocr .
   \`\`\`

2. **Deploy**
   - Deploy to your preferred platform (Railway, Render, etc.)
   - Add `MONGO_URI` environment variable
   - Note the service URL

3. **Connect to Next.js**
   - Add OCR service URL to Next.js environment
   - Update API routes to call OCR service
