# 🚀 Platform Subdomain Deployment Guide

## Overview
This guide walks you through deploying your messaging system to Railway (backend) and Vercel (frontend) with proper CORS configuration.

## 📋 Prerequisites

- **Railway Account**: Sign up at [railway.app](https://railway.app)
- **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- **GitHub Repository**: Push your code to GitHub
- **Environment Variables**: Database (Neon), Redis (Upstash), Twilio, Email

## 🏗️ Deployment Process

### Step 1: Deploy Backend to Railway

1. **Connect Repository**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository and select the `backend` folder

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project → Variables
   - Add all variables from `backend/.env`:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your_neon_database_url
   REDIS_URL=your_upstash_redis_url
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email
   FRONTEND_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   ```

4. **Get Railway URL**
   - After deployment, copy your Railway subdomain (e.g., `https://my-app.railway.app`)
   - This will be your backend API URL

### Step 2: Update Frontend Configuration

1. **Update Frontend Environment**
   - Edit `frontend/.env.production`
   - Replace placeholder URLs with your Railway backend URL:
   ```env
   VITE_API_URL=https://your-app.railway.app/api
   VITE_BACKEND_URL=https://your-app.railway.app
   VITE_SOCKET_URL=https://your-app.railway.app
   ```

### Step 3: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add production environment variables from `.env.production`

4. **Get Vercel URL**
   - After deployment, copy your Vercel subdomain (e.g., `https://my-app.vercel.app`)

### Step 4: Update Backend CORS Configuration

1. **Update Railway Environment Variables**
   - Go back to Railway dashboard → Variables
   - Update these variables with your Vercel URL:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   ```

2. **Redeploy Backend**
   - Railway will automatically redeploy with new environment variables
   - Or trigger manual redeploy if needed

## 🔧 Configuration Files Created

### Backend Environment (`.env`)
```env
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
# ... other variables
```

### Frontend Production Environment (`.env.production`)
```env
VITE_API_URL=https://your-app.railway.app/api
VITE_BACKEND_URL=https://your-app.railway.app
VITE_SOCKET_URL=https://your-app.railway.app
VITE_NODE_ENV=production
```

### Enhanced CORS Middleware
- **File**: `backend/src/middleware/security.ts`
- **Features**:
  - Production-ready CORS configuration
  - Support for platform subdomains
  - Vercel preview URL support
  - Enhanced logging and debugging

## 🚦 Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-app.railway.app/health

# API endpoint
curl https://your-app.railway.app/api
```

### 2. Test Frontend
- Visit: `https://your-app.vercel.app`
- Check browser console for CORS errors
- Test login/register functionality
- Test real-time messaging (Socket.IO)

### 3. Test CORS
```javascript
// In browser console on your frontend
fetch('https://your-app.railway.app/api')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## 🐛 Troubleshooting

### Common CORS Issues

1. **"Access to fetch blocked by CORS policy"**
   - Check `ALLOWED_ORIGINS` in Railway environment variables
   - Ensure both localhost and Vercel URLs are included
   - Verify URLs don't have trailing slashes

2. **Socket.IO Connection Failed**
   - Check `VITE_SOCKET_URL` in frontend environment
   - Verify WebSocket support in Railway deployment
   - Check browser network tab for WebSocket errors

3. **Environment Variables Not Loading**
   - Ensure variables are set in Railway dashboard
   - Check variable names match exactly (case-sensitive)
   - Trigger manual redeploy after changing variables

### Debug Mode

1. **Enable Backend Logging**
   ```env
   NODE_ENV=development  # Temporarily for debugging
   ```

2. **Check Railway Logs**
   - Railway Dashboard → Project → Deployments → View Logs

3. **Check Vercel Logs**
   - Vercel Dashboard → Project → Functions → View Logs

## 🔄 Development Workflow

### Local Development
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### Production Updates
1. Make changes locally
2. Test with local development setup
3. Commit and push to GitHub
4. Railway and Vercel auto-deploy from main branch
5. Update environment variables if needed

## 📝 Security Checklist

- ✅ Strong JWT secrets in production
- ✅ HTTPS-only cookies in production
- ✅ Rate limiting configured
- ✅ CORS properly configured
- ✅ Database connection secured (SSL)
- ✅ Redis connection secured
- ✅ No secrets in client-side code
- ✅ Environment variables not exposed

## 🚀 Production URLs

After successful deployment:

- **Backend API**: `https://your-app.railway.app/api`
- **Frontend App**: `https://your-app.vercel.app`
- **WebSocket**: `https://your-app.railway.app` (Socket.IO)
- **Health Check**: `https://your-app.railway.app/health`

---

**Need Help?** Check the platform-specific documentation:
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)