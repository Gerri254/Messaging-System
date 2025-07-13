# ⚡ Quick Start Guide (15 Minutes)

## 🚀 TL;DR - Get Running Fast

### Prerequisites Check
```bash
node --version  # Should be 16+
npm --version   # Should be 8+
git --version   # Any version
```

### 1. Get Free Services (5 minutes)
- **Database**: Sign up at [neon.tech](https://neon.tech) → Create project → Copy connection string
- **Redis**: Sign up at [upstash.com](https://upstash.com) → Create database → Copy Redis URL
- **SMS**: Sign up at [twilio.com](https://twilio.com) → Get SID, Token, Phone number

### 2. Configure Environment (3 minutes)
```bash
cd backend
nano .env

# Update these 4 critical lines:
DATABASE_URL="your_neon_connection_string"
REDIS_URL="your_upstash_redis_url" 
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Generate secrets:
JWT_SECRET="$(openssl rand -base64 32)"
SESSION_SECRET="$(openssl rand -base64 32)"
```

### 3. Install & Run (2 minutes)
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
npm install  
npm run dev
```

### 4. Test (1 minute)
- Open http://localhost:3000
- Register account
- Send message

## 🎉 Done! 

**Working features:** Authentication, Real-time messaging, Contact management, Templates, Analytics

**Optional:** Email setup for notifications (Gmail App Password)

---

## 📋 Detailed Setup Available
- See `COMPLETE_SETUP_PROCEDURE.md` for comprehensive guide
- See `REQUIRED_INPUTS.md` for service signup details
- See `SETUP_GUIDE.md` for configuration reference