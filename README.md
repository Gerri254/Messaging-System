# 🚀 Client-Server Messaging Syste

A comprehensive, enterprise-grade messaging system featuring real-time communication, SMS integration, contact management, and advanced analytics. Built with modern web technologies for scalability and performance.

## 🌟 Overview

This project is a full-stack messaging platform designed for businesses and organizations that need reliable, real-time communication capabilities. It combines traditional messaging with modern features like SMS integration, template management, and detailed analytics.

### Key Highlights
- **Real-time messaging** with Socket.IO
- **SMS integration** via Twilio
- **Advanced contact management** with groups and tags
- **Template system** for consistent messaging
- **Analytics dashboard** with performance metrics
- **Enterprise security** with JWT authentication and rate limiting
- **Modern UI/UX** with glassmorphism design
- **Mobile-responsive** design for all devices

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Session management with Redis caching
- Rate limiting for API endpoints and SMS
- CSRF protection and security headers
- Input sanitization and validation
- Audit logging for compliance
- Role-based access control

### 💬 Messaging System
- **Real-time messaging** with Socket.IO WebSockets
- **Rich text editor** with formatting support
- **Message templates** for consistent communication
- **Message scheduling** for delayed delivery
- **Bulk SMS campaigns** via Twilio integration
- **Message status tracking** (sent, delivered, failed)
- **Delivery reports** and analytics
- **Message history** with search and filtering

### 👥 Contact Management
- **Advanced contact search** and filtering
- **Bulk operations** (import/export CSV)
- **Contact groups** and custom tags
- **Custom contact fields** for additional data
- **Contact engagement analytics**
- **Duplicate detection** and management
- **Contact lifecycle tracking**

### 📊 Analytics & Reporting
- **Real-time dashboard** with customizable widgets
- **Message delivery analytics** and success rates
- **Contact engagement metrics**
- **Campaign performance tracking**
- **Cost analysis** for SMS campaigns
- **Export reports** in multiple formats (PDF, CSV, Excel)
- **Historical data analysis** with charts and graphs

### 🎨 Modern UI/UX
- **Glassmorphism design** with Tailwind CSS
- **Dark/light theme** support
- **Mobile-first responsive** design
- **Micro-interactions** with Framer Motion
- **Accessible design** patterns (WCAG compliant)
- **Loading states** and error handling
- **Toast notifications** for user feedback

## 🏗️ Technology Stack

### Backend (Node.js/TypeScript)
```
├── Runtime: Node.js 18+
├── Framework: Express.js
├── Database: PostgreSQL with Prisma ORM
├── Cache: Redis for sessions and caching
├── Authentication: JWT with bcrypt
├── Real-time: Socket.io for WebSockets
├── SMS: Twilio integration
├── Email: Nodemailer with Gmail/SMTP
├── Testing: Jest with comprehensive test suite
├── Security: Helmet, CORS, rate limiting
└── Monitoring: Performance and memory tracking
```

### Frontend (React/TypeScript)
```
├── Framework: React 18 with TypeScript
├── Build Tool: Vite for fast development
├── Styling: Tailwind CSS with custom themes
├── State Management: Zustand for global state
├── Data Fetching: React Query (TanStack Query)
├── Animations: Framer Motion for interactions
├── Icons: Heroicons and Lucide React
├── Forms: React Hook Form with validation
├── Routing: React Router DOM
├── Testing: Vitest with React Testing Library
└── UI Components: Custom component library
```

### Database Schema
```
├── Users: Authentication and profile management
├── Contacts: Contact information and relationships
├── Contact Groups: Organization and categorization
├── Messages: Message content and metadata
├── Message Templates: Reusable message templates
├── Message Recipients: Individual recipient tracking
├── Message Logs: Delivery and status tracking
├── User Sessions: Session management
├── System Config: Application configuration
└── Audit Logs: Compliance and tracking
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- PostgreSQL database (or Neon cloud database)
- Redis instance (or Upstash cloud Redis)
- Twilio account for SMS
- Gmail account for email notifications

### Option 1: Express Setup (15 minutes)
```bash
# Clone and navigate
git clone <repository-url>
cd Client-Server-Project/messaging-system

# Quick setup with free services
cd backend
cp .env.example .env
# Update .env with your service credentials

# Install and run
npm install && cd ../frontend && npm install
cd ../backend && npx prisma generate && npx prisma db push
npm run dev  # Backend on port 5000

# In new terminal
cd ../frontend && npm run dev  # Frontend on port 3000
```

### Option 2: Comprehensive Setup
Follow the detailed guides in the `messaging-system/` directory:
- **`QUICK_START.md`** - 15-minute rapid deployment
- **`COMPLETE_SETUP_PROCEDURE.md`** - 30-45 minute comprehensive setup
- **`DEPLOYMENT_GUIDE.md`** - Production deployment guide

## 📁 Project Structure

```
Client-Server-Project/
├── messaging-system/                    # Main application directory
│   ├── backend/                        # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── app.ts                  # Main application entry
│   │   │   ├── config/                 # Database, Redis, environment config
│   │   │   ├── controllers/            # Request handlers
│   │   │   │   ├── authController.ts   # Authentication logic
│   │   │   │   ├── messageController.ts # Message handling
│   │   │   │   ├── contactController.ts # Contact management
│   │   │   │   ├── templateController.ts # Template operations
│   │   │   │   └── analyticsController.ts # Analytics data
│   │   │   ├── middleware/             # Security and performance middleware
│   │   │   │   ├── auth.ts            # JWT authentication
│   │   │   │   ├── security.ts        # CORS, rate limiting, sanitization
│   │   │   │   ├── validation.ts      # Input validation
│   │   │   │   └── performance.ts     # Monitoring and optimization
│   │   │   ├── routes/                # API route definitions
│   │   │   ├── services/              # Business logic layer
│   │   │   │   ├── authService.ts     # User authentication
│   │   │   │   ├── messageService.ts  # Message processing
│   │   │   │   ├── smsService.ts      # Twilio SMS integration
│   │   │   │   ├── emailService.ts    # Email notifications
│   │   │   │   ├── socketService.ts   # Real-time communication
│   │   │   │   └── analyticsService.ts # Data analysis
│   │   │   └── utils/                 # Helper functions
│   │   ├── prisma/
│   │   │   └── schema.prisma          # Database schema
│   │   ├── tests/                     # Test suites
│   │   └── package.json               # Backend dependencies
│   │
│   ├── frontend/                       # React/TypeScript frontend
│   │   ├── src/
│   │   │   ├── App.tsx                # Main application component
│   │   │   ├── components/            # Reusable UI components
│   │   │   │   ├── auth/              # Authentication components
│   │   │   │   ├── messaging/         # Messaging interface
│   │   │   │   ├── layout/            # Layout components
│   │   │   │   └── ui/                # Base UI components
│   │   │   ├── pages/                 # Application pages
│   │   │   │   ├── auth/              # Login, register, forgot password
│   │   │   │   ├── dashboard/         # Main dashboard
│   │   │   │   ├── messaging/         # Messaging interface
│   │   │   │   ├── contacts/          # Contact management
│   │   │   │   ├── templates/         # Template management
│   │   │   │   └── analytics/         # Analytics dashboard
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── store/                 # Zustand state management
│   │   │   ├── utils/                 # Helper functions
│   │   │   └── types/                 # TypeScript type definitions
│   │   └── package.json               # Frontend dependencies
│   │
│   └── Documentation/                  # Setup and deployment guides
│       ├── README.md                  # Project overview (existing)
│       ├── QUICK_START.md            # 15-minute setup guide
│       ├── COMPLETE_SETUP_PROCEDURE.md # Comprehensive setup
│       ├── DEPLOYMENT_GUIDE.md       # Production deployment
│       ├── REQUIRED_INPUTS.md        # Service credentials guide
│       └── SETUP_GUIDE.md           # Configuration reference
│
└── README.md                          # This comprehensive project overview
```

## 🔧 Configuration & Environment

### Required Services
1. **Database**: PostgreSQL (local or Neon cloud)
2. **Cache**: Redis (local or Upstash cloud)
3. **SMS**: Twilio account with phone number
4. **Email**: Gmail with app password or SMTP server

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Security
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"

# Twilio SMS
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# CORS
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000"
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                   # Run all tests
npm run test:ui           # UI test runner
npm run test:coverage     # Coverage report
```

### Integration Testing
```bash
# Test SMS functionality
cd backend
node src/utils/testSMS.js

# Test Socket.IO real-time features
open src/utils/testSocket.html
```

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd frontend && npm run dev
```

### Production Options

#### Option 1: Platform Deployment (Recommended)
- **Backend**: Railway, Heroku, or DigitalOcean App Platform
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Neon, Supabase, or managed PostgreSQL
- **Redis**: Upstash, Redis Cloud, or managed Redis

#### Option 2: Self-Hosted
- **Server**: Ubuntu/CentOS VPS with Nginx
- **Database**: Self-hosted PostgreSQL
- **Redis**: Self-hosted Redis instance
- **SSL**: Let's Encrypt certificates

#### Option 3: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📊 Performance & Monitoring

### Built-in Features
- **Performance monitoring** with request timing
- **Memory usage tracking** and alerts
- **Rate limiting** to prevent abuse
- **Compression** for faster responses
- **Caching** with Redis for frequently accessed data
- **Database query optimization** with Prisma
- **Connection pooling** for database efficiency

### Monitoring Endpoints
- **Health Check**: `/health` - System status and metrics
- **API Status**: `/api` - API version and status
- **Metrics**: Built-in performance tracking

## 🔒 Security Features

### Authentication & Authorization
- **JWT tokens** with secure secret keys
- **Password hashing** with bcrypt
- **Session management** with Redis
- **Rate limiting** per IP and user
- **Input validation** and sanitization

### Data Protection
- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **SQL injection** prevention with Prisma
- **XSS protection** with input sanitization
- **CSRF protection** for form submissions

### Compliance
- **Audit logging** for all user actions
- **Data encryption** in transit and at rest
- **GDPR compliance** with data export/deletion
- **SOC 2 considerations** for enterprise use

## 💰 Cost Estimation

### Free Tier (Development)
- **Database**: Neon free tier (512MB)
- **Redis**: Upstash free tier (10k requests/day)
- **SMS**: Twilio free trial ($15 credit)
- **Hosting**: Vercel/Railway free tiers
- **Total**: $0/month

### Production (Small Scale)
- **Database**: Neon Pro ($19/month)
- **Redis**: Upstash Pro ($7/month)
- **SMS**: ~$0.0075 per message
- **Hosting**: Vercel Pro ($20/month)
- **Total**: ~$46/month + SMS usage

### Enterprise (Large Scale)
- **Database**: Managed PostgreSQL ($100+/month)
- **Redis**: Redis Cloud Pro ($50+/month)
- **SMS**: Volume pricing available
- **Hosting**: Dedicated infrastructure
- **Total**: Varies based on usage

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the setup guide in `COMPLETE_SETUP_PROCEDURE.md`
4. Make your changes
5. Run tests and ensure they pass
6. Submit a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Jest/Vitest** for testing
- **Conventional commits** for commit messages

## 📚 Documentation

### Setup Guides
- **`QUICK_START.md`**: Get running in 15 minutes
- **`COMPLETE_SETUP_PROCEDURE.md`**: Detailed 30-45 minute setup
- **`DEPLOYMENT_GUIDE.md`**: Production deployment guide
- **`REQUIRED_INPUTS.md`**: Service credentials and setup

### API Documentation
- **REST API**: OpenAPI/Swagger documentation
- **WebSocket Events**: Real-time messaging protocols
- **Database Schema**: Prisma schema documentation

## 🆘 Support & Troubleshooting

### Common Issues
- **Database connection**: Check connection string and network access
- **Redis connection**: Verify Redis URL and authentication
- **CORS errors**: Update ALLOWED_ORIGINS environment variable
- **SMS not sending**: Verify Twilio credentials and phone number format
- **Email failures**: Check Gmail app password and SMTP settings

### Getting Help
1. Check the troubleshooting sections in setup guides
2. Review application logs for specific error messages
3. Verify all environment variables are correctly set
4. Test external service connections (database, Redis, Twilio)

## 📄 License

MIT License - see LICENSE file for details.

## 🏆 Acknowledgments

- **Prisma** for excellent database tooling
- **Socket.IO** for real-time communication
- **Twilio** for reliable SMS services
- **Tailwind CSS** for rapid UI development
- **React Query** for efficient data fetching
- **Zustand** for simple state management

---

**Ready to get started?** Follow the `QUICK_START.md` guide in the `messaging-system/` directory for a 15-minute setup, or use `COMPLETE_SETUP_PROCEDURE.md` for a comprehensive installation.

**Questions?** Check the troubleshooting sections in the setup guides or review the application logs for specific error messages.
