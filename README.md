# BrainFlow - Academic Project Management Platform

<div align="center">

![BrainFlow Banner](https://via.placeholder.com/800x200/2563eb/ffffff?text=BrainFlow+-+Transform+Project+Management+into+Smart+Collaboration)

**Transform Project Management into Smart Collaboration**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748)](https://www.prisma.io/)

[Features](#-features) • [Quick Start](#-quick-start-with-docker) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start-with-docker)
- [Manual Setup](#-manual-setup)
- [Project Structure](#-project-structure)
- [Authentication Flow](#-authentication-flow)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

**BrainFlow** is a comprehensive academic project management platform designed for educational institutions. It streamlines the entire project lifecycle from team formation to final assessment, with built-in AI-powered plagiarism detection and real-time collaboration features.

### Why BrainFlow?

- 🎯 **Unified Platform**: Manage teams, projects, submissions, and assessments in one place
- 🤖 **AI-Powered**: Advanced plagiarism detection using OpenAI and Pinecone
- 📊 **Real-Time Analytics**: Track progress, submissions, and performance metrics
- 🔒 **Secure**: Role-based access control with NextAuth.js authentication
- 🚀 **Modern Stack**: Built with Next.js 15, React 19, and TypeScript
- 🐳 **Docker Ready**: Complete containerization for easy deployment

---

## ✨ Features

### For Students
- ✅ **Team Management**: Create or join teams with unique invite codes
- ✅ **Project Submission**: Upload SRS reports, presentations, and code repositories
- ✅ **Weekly Reports**: Submit progress updates with images and descriptions
- ✅ **Real-Time Feedback**: Receive instant notifications on assessments
- ✅ **Plagiarism Reports**: View detailed similarity analysis and sources

### For Teachers/Mentors
- ✅ **Team Oversight**: Monitor assigned teams and their progress
- ✅ **Assessment Tools**: Grade projects with customizable rubrics
- ✅ **Plagiarism Review**: Review AI-generated plagiarism reports
- ✅ **Feedback System**: Provide detailed comments and suggestions
- ✅ **Analytics Dashboard**: Track student performance and engagement

### For Administrators
- ✅ **User Management**: Manage students, teachers, and roles
- ✅ **Team Assignment**: Assign mentors to teams
- ✅ **System Analytics**: Department-wide metrics and insights
- ✅ **Bulk Operations**: Email notifications and data exports
- ✅ **Audit Logs**: Complete activity tracking for transparency

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.0 with App Router
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: React Hooks + Server Components
- **Authentication**: NextAuth.js 4.24.11
- **Type Safety**: TypeScript 5

### Backend
- **API Framework**: Next.js API Routes + Elysia.js
- **Runtime**: Bun (for backend service)
- **Database ORM**: Prisma 6.14.0
- **Database**: PostgreSQL (NeonDB or self-hosted)

### Plagiarism Service
- **Framework**: FastAPI (Python)
- **AI Model**: OpenAI GPT-4
- **Vector Database**: Pinecone
- **Text Processing**: LangChain

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL 16 Alpine
- **Reverse Proxy**: Built-in Next.js server
- **Package Manager**: Bun

---

## 🚀 Quick Start with Docker

The fastest way to get BrainFlow running is with Docker Compose. This will start all services (Frontend, Backend, Plagiarism Checker, and Database) with a single command.

### Prerequisites

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **Git** - [Install Git](https://git-scm.com/)
- **Database**: Either [NeonDB](https://neon.tech) (cloud) OR use local PostgreSQL (included in Docker)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/brainflow.git
cd brainflow
```

### Step 2: Set Up Database

**Option A: NeonDB (Recommended - Free Cloud PostgreSQL)**

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

**Option B: Local PostgreSQL**

Use `docker-compose.local-db.yml` instead of `docker-compose.yml` (see instructions below)

### Step 3: Configure Environment Variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

**For NeonDB (Cloud Database):**

```env
# NeonDB Connection String (from Neon Console)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"

# NextAuth Configuration (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Required for Login)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Plagiarism Service (Optional - for plagiarism detection feature)
OPENAI_API="your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
```

**For Local PostgreSQL:**

```env
# Local PostgreSQL (no need to change if using docker-compose.local-db.yml)
DATABASE_URL="postgresql://admin:password@postgres:5432/college_db"
DIRECT_URL="postgresql://admin:password@postgres:5432/college_db"

# ... rest of the configuration same as above
```

### Step 4: Start the Application

**If using NeonDB (cloud database):**

```bash
docker compose up --build
```

**If using Local PostgreSQL:**

```bash
docker compose -f docker-compose.local-db.yml up --build
```

This will start all services:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Plagiarism Checker**: http://localhost:5001 (Internal: 5000)
- **PostgreSQL**: Port 5432 (only if using local-db.yml)

### Step 5: Initialize Database

In a new terminal, run the database migrations and seed:

```bash
# Enter the frontend container
docker exec -it brainflow-frontend sh

# Run migrations
bunx prisma db push

# Seed the database with sample data
bun run prisma/seed.ts

# Exit container
exit
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **API Health**: http://localhost:8000/api/health

### Default Credentials

After seeding, you can login with:

**Admin:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

---

## 🔧 Manual Setup (Local Development)

If you prefer to run services individually without Docker:

### Prerequisites

- **Bun** (v1.0.0+) - [Install Bun](https://bun.sh/docs/installation)
- **Node.js** (v18+) - [Install Node.js](https://nodejs.org/)
- **PostgreSQL** (v14+) - [Install PostgreSQL](https://www.postgresql.org/download/)
- **Python** (v3.10+) - [Install Python](https://www.python.org/downloads/)

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/brainflow.git
cd brainflow

# Install frontend dependencies
cd frontend
bun install
cd ..

# Install backend dependencies
cd backend
bun install
cd ..

# Install plagiarism checker dependencies
cd Plagiarism_Checker
pip install -r requirements.txt
cd ..
```

### Step 2: Database Setup

**Option A: Use Docker for PostgreSQL only**
```bash
cd docker
docker compose up -d postgres
cd ..
```

**Option B: Use local PostgreSQL**
```bash
# Create database
createdb college_db

# Or using psql
psql -U postgres
CREATE DATABASE college_db;
\q
```

### Step 3: Configure Environment

Create `.env` file in the root directory:

```env
# Database (use localhost for local setup)
DATABASE_URL="postgresql://admin:password@localhost:5432/college_db"
DIRECT_URL="postgresql://admin:password@localhost:5432/college_db"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# API
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Plagiarism (Optional)
OPENAI_API="your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
```

Also create `frontend/.env.local`:

```env
DATABASE_URL="postgresql://admin:password@localhost:5432/college_db"
DIRECT_URL="postgresql://admin:password@localhost:5432/college_db"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Step 4: Initialize Database

```bash
cd frontend

# Generate Prisma Client
bunx prisma generate

# Push schema to database
bunx prisma db push

# Seed database with sample data
bun run ../prisma/seed.ts

cd ..
```

### Step 5: Start Development Servers

Open 3 terminal windows:

**Terminal 1 - Frontend:**
```bash
cd frontend
bun run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
bun run index.ts
```

**Terminal 3 - Plagiarism Checker (Optional):**
```bash
cd Plagiarism_Checker
python -m uvicorn main:app --reload --port 5000
```

### Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Plagiarism API**: http://localhost:5000

---

## 📁 Project Structure

```
brainflow/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── auth/           # Authentication pages
│   │   │   │   ├── login/      # Login page
│   │   │   │   ├── role/       # Role selection
│   │   │   │   └── error/      # Auth error page
│   │   │   ├── student/        # Student dashboard & features
│   │   │   │   ├── dashboard/  # Student dashboard
│   │   │   │   ├── team/       # Team management
│   │   │   │   └── project-submission/  # Project submission
│   │   │   ├── teacher/        # Teacher dashboard & features
│   │   │   ├── admin/          # Admin dashboard & features
│   │   │   └── api/            # Next.js API routes
│   │   │       ├── auth/       # NextAuth endpoints
│   │   │       ├── teams/      # Team management APIs
│   │   │       ├── user/       # User profile APIs
│   │   │       └── admin/      # Admin APIs
│   │   ├── components/         # Reusable UI components
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── lib/               # Utility functions
│   │   │   ├── prisma.ts      # Prisma client instance
│   │   │   └── utils.ts       # Helper functions
│   │   └── types/             # TypeScript type definitions
│   ├── prisma/                # Prisma schema (copy for Docker)
│   ├── public/                # Static assets
│   │   └── uploads/           # File uploads directory
│   ├── Dockerfile             # Frontend Docker configuration
│   └── package.json           # Frontend dependencies
│
├── backend/                    # Elysia.js backend service
│   ├── index.ts               # Main server file
│   ├── package.json           # Backend dependencies
│   └── Dockerfile             # Backend Docker configuration
│
├── Plagiarism_Checker/         # Python FastAPI service
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── test_app.py            # API tests
│   └── Dockerfile             # Plagiarism service Docker config
│
├── prisma/                     # Shared Prisma schema (source of truth)
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database migrations (if using migrate)
│   └── seed.ts                # Database seeding script
│
├── docker-compose.yml          # Docker Compose configuration
├── .env                       # Environment variables (create this)
├── package.json               # Root package.json
└── README.md                  # This file
```

### Key Directories

- **`/frontend`**: Next.js 15 application with App Router, React Server Components, and API routes
- **`/backend`**: Elysia.js backend service (optional, can use Next.js API routes only)
- **`/Plagiarism_Checker`**: Python FastAPI service for AI-powered plagiarism detection
- **`/prisma`**: Database schema and migrations (shared by frontend and backend)

---

## 🔐 Authentication Flow

BrainFlow uses a multi-step authentication and onboarding flow:

### 1. Login
- **Google OAuth**: For students and teachers
- **Credentials**: For admin accounts

### 2. Role Selection
- New users select their role (Student/Teacher/Admin)
- Role is stored in the database

### 3. Profile Completion
- **Students**: Enter enrollment number, department, semester, etc.
- **Teachers**: Enter expertise, technologies, department
- **Admins**: Automatically granted full access

### 4. Dashboard Redirect
- Users are redirected to their role-specific dashboard
- Session includes role, profile status, and permissions

### 5. Team Verification Flow (Students Only)

After completing their profile, students must create or join a team and get it verified:

#### Step 1: Team Creation/Joining
- **Create Team**: Student becomes team leader and receives a unique team code
- **Join Team**: Student enters team code to join an existing team

#### Step 2: Team Requirements
Before verification, teams must meet these criteria:
- ✅ Exactly **4 members** from the same department and institution
- ✅ Upload **SRS (Software Requirements Specification)** document (PDF)
- ✅ Provide **GitHub repository** link
- ✅ Pass **plagiarism check** (< 60% similarity)

#### Step 3: Verification Process
1. Team leader uploads SRS document
2. System validates team size and member compatibility
3. SRS is sent to plagiarism detection service (port 5001)
4. If plagiarism score < 60%, team is **verified** ✅
5. If plagiarism score ≥ 60%, team must revise and resubmit ❌

#### Step 4: Access Control
- **No Team**: Redirected to team setup page
- **Unverified Team**: Redirected to team management page
- **Verified Team**: Full access to dashboard and features

### Authentication Endpoints

```typescript
// Login
POST /api/auth/signin

// Set user role
POST /api/user/role
Body: { role: 'STUDENT' | 'TEACHER' | 'ADMIN' }

// Create student profile
POST /api/user/profile/student
Body: { enrollmentNo, department, semester, ... }

// Create teacher profile
POST /api/user/profile/teacher
Body: { expertise, technologies, department }
```

---

## 📚 API Documentation

### User Management

#### Get Current User
```http
GET /api/user/profile
Authorization: Required
```

#### Update User Role
```http
POST /api/user/role
Content-Type: application/json

{
  "role": "STUDENT" | "TEACHER" | "ADMIN"
}
```

### Team Management

#### Get All Teams (Admin)
```http
GET /api/admin/teams
Authorization: Admin only
```

#### Create Team (Student)
```http
POST /api/teams
Content-Type: application/json

{
  "name": "Team Alpha",
  "department": "Computer Science"
}
```

#### Join Team
```http
POST /api/teams/join
Content-Type: application/json

{
  "code": "TEAM-CODE-123"
}
```

### Project Management

#### Submit Project
```http
POST /api/projects/submit
Content-Type: multipart/form-data

{
  "technology": "React",
  "domain": "Web Development",
  "problemStatement": "...",
  "srsReport": File
}
```

#### Check Plagiarism
```http
POST /api/plagiarism/check
Content-Type: application/json

{
  "submissionId": "submission-id"
}
```

### Assessment

#### Create Assessment (Teacher)
```http
POST /api/assessments
Content-Type: application/json

{
  "projectId": "project-id",
  "totalMarks": 100,
  "rubricJson": {...},
  "remarks": "Excellent work"
}
```

---

## 🌍 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | Direct database URL (for migrations) | Same as DATABASE_URL |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Random 32+ character string |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `OPENAI_API` | OpenAI API key for plagiarism | Required for plagiarism feature |
| `PINECONE_API_KEY` | Pinecone API key | Required for plagiarism feature |
| `NODE_ENV` | Environment mode | `development` |

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to `.env`

---

## 🚢 Deployment

### Production Deployment with Docker

#### 1. Prepare Production Environment

Create a production `.env` file:

```env
# Production Database (use your cloud database)
DATABASE_URL="postgresql://user:password@your-db-host:5432/brainflow_prod"
DIRECT_URL="postgresql://user:password@your-db-host:5432/brainflow_prod"

# Production URLs
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Secure secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-production-secret-min-32-chars"

# Google OAuth (production credentials)
GOOGLE_CLIENT_ID="your-prod-client-id"
GOOGLE_CLIENT_SECRET="your-prod-client-secret"

# Plagiarism Service
OPENAI_API="your-openai-api-key"
PINECONE_API_KEY="your-pinecone-api-key"

# Production mode
NODE_ENV="production"
```

#### 2. Build and Deploy

```bash
# Build all services
docker compose build

# Tag images for your registry
docker tag proj_ctrl-frontend:latest your-registry/brainflow-frontend:latest
docker tag proj_ctrl-backend:latest your-registry/brainflow-backend:latest
docker tag proj_ctrl-plagiarism-checker:latest your-registry/brainflow-plagiarism:latest

# Push to registry
docker push your-registry/brainflow-frontend:latest
docker push your-registry/brainflow-backend:latest
docker push your-registry/brainflow-plagiarism:latest

# On production server
docker compose -f docker-compose.yml up -d
```

#### 3. Initialize Production Database

```bash
# Run migrations
docker exec -it brainflow-frontend bunx prisma db push

# Seed initial admin user
docker exec -it brainflow-frontend bun run prisma/seed.ts
```

### Deploy to Cloud Platforms

#### Vercel (Frontend Only)

1. **Import Project:**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Set root directory to `frontend`

2. **Configure Build:**
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: `bun install`

3. **Environment Variables:**
   Add all required variables in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Vercel domain)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

4. **Deploy:**
   - Click "Deploy"
   - Update Google OAuth redirect URIs to include Vercel domain

#### Railway (Full Stack)

1. **Create New Project:**
   - Import from GitHub
   - Railway will detect docker-compose.yml

2. **Configure Services:**
   - Add environment variables for each service
   - Set up PostgreSQL database plugin

3. **Deploy:**
   - Railway will automatically deploy on push to main branch

#### Database Options

**NeonDB (Recommended for Serverless)**
1. Sign up at [Neon](https://neon.tech/)
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` and `DIRECT_URL`

**Supabase**
1. Create project at [Supabase](https://supabase.com/)
2. Get PostgreSQL connection string
3. Update environment variables

**Railway PostgreSQL**
1. Add PostgreSQL plugin in Railway
2. Use provided connection string

### Post-Deployment Checklist

- [ ] Update Google OAuth redirect URIs
- [ ] Run database migrations
- [ ] Seed admin user
- [ ] Test authentication flow
- [ ] Verify file uploads work
- [ ] Test plagiarism checker integration
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS if needed

---

## 🧪 Testing

### Manual Testing

After starting the application, you can test the following flows:

#### 1. Authentication Flow
1. Visit http://localhost:3000/auth/login
2. Login with test credentials or Google OAuth
3. Select role (Student/Teacher/Admin)
4. Complete profile setup
5. Access role-specific dashboard

#### 2. Student Flow
1. Login as student
2. Create or join a team using team code
3. Submit project details (technology, domain, problem statement)
4. Upload SRS report
5. View team members and project status

#### 3. Teacher Flow
1. Login as teacher
2. View assigned teams
3. Review project submissions
4. Provide assessments and feedback
5. Check plagiarism reports

#### 4. Admin Flow
1. Login as admin
2. View all teams and users
3. Assign mentors to teams
4. Monitor system-wide analytics
5. Manage user roles and permissions

### Test Credentials

After seeding the database, use these credentials:

**Admin:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher:**
- Email: `teacher@college.edu`
- Password: `teacher123`

**Student:**
- Email: `student@college.edu`
- Password: `student123`

> **Note**: These are test accounts. In production, use Google OAuth for authentication.

### API Testing

Test the plagiarism checker API:

```bash
# Health check
curl http://localhost:5001/health

# Test plagiarism detection (requires OpenAI and Pinecone keys)
curl -X POST http://localhost:5001/check-plagiarism \
  -H "Content-Type: application/json" \
  -d '{"text": "Your SRS document text here"}'
```

---

## 🐛 Troubleshooting

### Common Issues

#### Docker Build Fails

**Problem**: Prisma schema validation error
```
Error: A one-to-one relation must use unique fields
```

**Solution**: Make sure you're using the latest code. The schema has been fixed to use one-to-many relations.

```bash
git pull origin main
docker compose build --no-cache
```

#### Database Connection Error

**Problem**: `Can't reach database server`

**Solution**:
1. Check if PostgreSQL is running: `docker ps`
2. Verify DATABASE_URL in `.env` file
3. For Docker: use `postgres` as hostname
4. For local: use `localhost` as hostname

#### Port Already in Use

**Problem**: `Port 3000 is already allocated`

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

#### Prisma Client Not Generated

**Problem**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
cd frontend
bunx prisma generate
```

#### Google OAuth Not Working

**Problem**: `Error: redirect_uri_mismatch`

**Solution**:
1. Go to Google Cloud Console
2. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Make sure NEXTAUTH_URL in `.env` matches your domain

#### Team Join Error

**Problem**: `You are already a member of this team`

**Solution**: This was a bug in earlier versions. Update to the latest code where the unique constraint on `currentTeamId` has been removed.

### Getting Help

If you encounter issues not listed here:

1. Check existing [GitHub Issues](https://github.com/your-username/brainflow/issues)
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Docker version, etc.)
3. Include relevant logs from `docker compose logs`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Test your changes before submitting PR
- Keep commits atomic and descriptive

### Code Style

- **Frontend**: Follow Next.js and React best practices
- **Backend**: Use async/await for asynchronous operations
- **Database**: Use Prisma for all database operations
- **Formatting**: Code is auto-formatted with Prettier (if configured)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Prisma** for the excellent ORM
- **Neon** for serverless PostgreSQL
- **Vercel** for Next.js framework
- **Elysia.js** for the fast backend framework
- **Bun** for the modern JavaScript runtime
- **shadcn/ui** for beautiful UI components
- **OpenAI** for AI-powered plagiarism detection

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Troubleshooting](#-troubleshooting) section** above
2. **Search existing [GitHub Issues](https://github.com/your-username/brainflow/issues)**
3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Docker version, etc.)
   - Relevant error logs

---

## 🗺️ Roadmap

### Planned Features

- [ ] **Mobile Application** - React Native app for iOS and Android
- [ ] **Advanced Analytics** - Detailed insights and performance metrics
- [ ] **Git Integration** - Direct integration with GitHub/GitLab
- [ ] **Video Uploads** - Support for video presentations
- [ ] **Peer Review System** - Student-to-student code reviews
- [ ] **Code Quality Checks** - Automated linting and quality analysis
- [ ] **Real-time Collaboration** - Live editing and chat features
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Dark Mode** - Theme customization
- [ ] **Email Notifications** - Automated email alerts
- [ ] **Export Reports** - PDF/Excel export functionality
- [ ] **API Documentation** - Swagger/OpenAPI docs

### Completed Features

- [x] Team management with invite codes
- [x] Project submission and tracking
- [x] AI-powered plagiarism detection
- [x] Role-based access control
- [x] Google OAuth authentication
- [x] Weekly progress reports
- [x] Assessment and grading system
- [x] Docker containerization

---

## 📊 Tech Stack Details

### Why These Technologies?

- **Next.js 15**: Latest features including App Router, Server Components, and improved performance
- **Bun**: Faster package manager and runtime compared to npm/yarn
- **Prisma**: Type-safe database access with excellent TypeScript support
- **PostgreSQL**: Robust, scalable relational database
- **NextAuth.js**: Flexible authentication with multiple providers
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **shadcn/ui**: High-quality, accessible React components
- **Docker**: Consistent development and deployment environments
- **FastAPI**: High-performance Python framework for ML services

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 🙏 Acknowledgments

Special thanks to the open-source community and these amazing projects:

- **[Next.js](https://nextjs.org/)** by Vercel - The React framework for production
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- **[Bun](https://bun.sh/)** - Fast all-in-one JavaScript runtime
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable components built with Radix UI
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL
- **[OpenAI](https://openai.com/)** - AI models for plagiarism detection
- **[Pinecone](https://www.pinecone.io/)** - Vector database for similarity search
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework

---

## 👥 Contributors

This project exists thanks to all the people who contribute.

<!-- Add contributor images here when you have contributors -->

Want to contribute? See our [Contributing Guidelines](#-contributing) above!

---

<div align="center">

**Made with ❤️ for educational institutions worldwide**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/your-username/brainflow/issues) • [Request Feature](https://github.com/your-username/brainflow/issues) • [Documentation](https://github.com/your-username/brainflow/wiki)

</div>
