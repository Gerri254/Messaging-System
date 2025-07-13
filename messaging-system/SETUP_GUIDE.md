# 🚀 Messaging System Setup Guide

This guide provides all the environment variables and external service configurations needed for seamless operation of the messaging system.

## 📋 Prerequisites

Before setting up environment variables, ensure you have:
- PostgreSQL database (local or cloud)
- Redis server (local or cloud)
- Twilio account for SMS functionality
- Email provider (Gmail, Outlook, etc.)

## 🔧 Environment Variables Setup

### Backend Configuration (.env file)

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URL="postgresql://username:password@localhost:5432/messaging_system?schema=public"
# 📍 Where to get: Set up PostgreSQL database locally or use cloud providers:
#    - Local: Install PostgreSQL, create database "messaging_system"
#    - Cloud: Neon (neon.tech), Supabase (supabase.com), Railway (railway.app)
#    - Format: postgresql://[username]:[password]@[host]:[port]/[database]

# ===========================================
# JWT AUTHENTICATION
# ===========================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
# 📍 Generate: Use a strong random string (32+ characters)
#    - Online: https://jwtsecret.com/generate
#    - Command: openssl rand -base64 32

JWT_EXPIRES_IN="7d"
# 📍 Token expiration time (7d = 7 days, 24h = 24 hours, etc.)

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=5000
# 📍 Backend server port (default: 5000)

NODE_ENV="development"
# 📍 Environment: "development", "production", or "test"

FRONTEND_URL="http://localhost:3000"
# 📍 Your frontend URL (update for production deployment)

# ===========================================
# TWILIO SMS SERVICE
# ===========================================
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
# 📍 Where to get: Twilio Console (console.twilio.com) → Account Info
#    - Sign up at twilio.com
#    - Navigate to Console Dashboard
#    - Copy "Account SID"

TWILIO_AUTH_TOKEN="your-twilio-auth-token"
# 📍 Where to get: Twilio Console → Account Info → Auth Token
#    - Click "View" to reveal the token

TWILIO_PHONE_NUMBER="your-twilio-phone-number"
# 📍 Where to get: Twilio Console → Phone Numbers → Manage → Active Numbers
#    - Purchase a phone number if you don't have one
#    - Format: +1234567890 (include country code)

# ===========================================
# REDIS CACHE/SESSION STORE
# ===========================================
REDIS_URL="redis://localhost:6379"
# 📍 Where to get: 
#    - Local: Install Redis locally
#    - Cloud: Redis Cloud (redis.com), Upstash (upstash.com)
#    - Format: redis://[host]:[port] or redis://[username]:[password]@[host]:[port]

# ===========================================
# EMAIL SERVICE
# ===========================================
EMAIL_HOST="smtp.gmail.com"
# 📍 SMTP servers:
#    - Gmail: smtp.gmail.com
#    - Outlook: smtp.office365.com
#    - Yahoo: smtp.mail.yahoo.com

EMAIL_PORT=587
# 📍 Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)

EMAIL_SECURE=false
# 📍 Set to "true" for port 465, "false" for port 587

EMAIL_USER="your-email@gmail.com"
# 📍 Your email address

EMAIL_PASSWORD="your-app-password"
# 📍 For Gmail: Use App Password (not regular password)
#    - Enable 2FA on Gmail
#    - Go to Google Account → Security → App passwords
#    - Generate 16-character app password

EMAIL_FROM="noreply@yourdomain.com"
# 📍 "From" address for system emails

# ===========================================
# SECURITY & RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
# 📍 Rate limit window in milliseconds (900000 = 15 minutes)

RATE_LIMIT_MAX_REQUESTS=100
# 📍 Maximum requests per window

BCRYPT_SALT_ROUNDS=12
# 📍 Password hashing strength (10-12 recommended)

ALLOWED_ORIGINS="http://localhost:3000"
# 📍 Comma-separated list of allowed frontend URLs for CORS

SESSION_SECRET="your-session-secret-key"
# 📍 Generate: Strong random string for session encryption
#    - Command: openssl rand -base64 32
```

### Frontend Configuration (.env file)

Create a `.env` file in the `frontend/` directory:

```bash
# ===========================================
# API CONFIGURATION
# ===========================================
VITE_API_URL=http://localhost:5000/api
# 📍 Backend API URL (update for production)

VITE_SOCKET_URL=http://localhost:5000
# 📍 Socket.IO server URL (same as backend URL without /api)

# ===========================================
# APP METADATA
# ===========================================
VITE_APP_NAME=MessageHub
# 📍 Your application name

VITE_APP_VERSION=1.0.0
# 📍 Application version
```

## 🗄️ Database Setup

### 1. PostgreSQL Setup

**Local Installation:**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Create Database:**
```sql
CREATE DATABASE messaging_system;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE messaging_system TO your_username;
```

**Cloud Options:**
- **Neon**: neon.tech (Free tier available)
- **Supabase**: supabase.com (Free tier available)
- **Railway**: railway.app
- **AWS RDS**: aws.amazon.com/rds/
- **Google Cloud SQL**: cloud.google.com/sql

### 2. Redis Setup

**Local Installation:**
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Windows
# Download from https://redis.io/download
```

**Cloud Options:**
- **Redis Cloud**: redis.com (Free tier available)
- **Upstash**: upstash.com (Free tier available)
- **AWS ElastiCache**: aws.amazon.com/elasticache/

## 📱 Twilio SMS Setup

1. **Sign up**: Go to twilio.com and create an account
2. **Get credentials**: Console → Account Info
   - Account SID
   - Auth Token
3. **Get phone number**: Console → Phone Numbers → Manage → Buy a number
4. **Copy values** to your `.env` file

## 📧 Email Setup (Gmail Example)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → App passwords
   - Select "Mail" and generate password
3. **Use App Password** in `EMAIL_PASSWORD` (not your regular password)

## 🚀 Running the Application

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Migration
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Start Services
```bash
# Start backend (in backend directory)
npm run dev

# Start frontend (in frontend directory)  
npm run dev
```

## 🔍 Verification Checklist

- [ ] PostgreSQL database connected
- [ ] Redis server running
- [ ] Twilio SMS credentials valid
- [ ] Email service configured
- [ ] JWT secret set
- [ ] Frontend connecting to backend
- [ ] Socket.IO real-time features working

## 🐛 Common Issues & Solutions

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists and user has permissions

### Twilio SMS Errors
- Verify account SID and auth token
- Check phone number format (+country code)
- Ensure sufficient Twilio account balance

### Email Delivery Issues
- Use App Password for Gmail (not regular password)
- Check firewall/port restrictions
- Verify SMTP settings for your provider

### CORS Errors
- Update ALLOWED_ORIGINS in backend .env
- Ensure FRONTEND_URL matches your frontend URL

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all external services (database, Redis, Twilio) are accessible
4. Check firewall and network connectivity

## 🔐 Security Notes

- Use strong, unique secrets in production
- Enable HTTPS in production
- Regularly rotate API keys and secrets
- Use environment-specific configurations
- Never commit `.env` files to version control