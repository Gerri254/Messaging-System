# 🚀 MessageHub - Enterprise Messaging System

A modern, full-stack messaging system built with React, TypeScript, Node.js, and PostgreSQL. Features real-time messaging, SMS integration, contact management, and advanced analytics.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Rate limiting and input sanitization
- CSRF protection and security headers
- Role-based access control

### 💬 Messaging System
- Real-time messaging with Socket.io
- Rich text editor with formatting
- Message templates and scheduling
- Bulk SMS campaigns via Twilio
- Message status tracking and delivery reports

### 👥 Contact Management
- Advanced contact search and filtering
- Bulk contact operations (import/export)
- Contact groups and tags
- Custom contact fields
- Contact engagement analytics

### 📊 Analytics & Reporting
- Real-time dashboard with customizable widgets
- Message delivery analytics
- Contact engagement metrics
- Campaign performance tracking
- Export reports in multiple formats

### 🎨 Modern UI/UX
- Glassmorphism design with Tailwind CSS
- Dark/light theme support
- Mobile-first responsive design
- Micro-interactions with Framer Motion
- Accessible design patterns

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for sessions and caching
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **SMS**: Twilio integration
- **Testing**: Jest with comprehensive test suite

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Testing**: Vitest with React Testing Library

## 🚀 Quick Start

### ⚡ Option 1: Quick Setup (15 minutes)
```bash
# Follow QUICK_START.md for rapid deployment
```

### 📋 Option 2: Complete Setup (30-45 minutes)
```bash
# Follow COMPLETE_SETUP_PROCEDURE.md for detailed guide
```

## 📚 Setup Documentation

- **`QUICK_START.md`** - Get running in 15 minutes
- **`COMPLETE_SETUP_PROCEDURE.md`** - Comprehensive 30-45 minute setup
- **`REQUIRED_INPUTS.md`** - All needed credentials and services
- **`SETUP_GUIDE.md`** - Configuration reference guide

## Project Structure

```
messaging-system/
   backend/
      src/
         controllers/
         middleware/
         models/
         routes/
         services/
         utils/
         config/
         app.ts
      prisma/
      package.json
      tsconfig.json
   frontend/
      src/
         components/
         pages/
         hooks/
         services/
         utils/
         types/
      public/
      package.json
      tailwind.config.js
   README.md
```

## License

MIT License