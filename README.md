# Project Control System

A full-stack web application built with Next.js, Elysia.js, Prisma, PostgreSQL, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Elysia.js with TypeScript (running on Bun)
- **Database**: PostgreSQL with Prisma ORM
- **Container**: Docker for PostgreSQL

## Project Structure

```
Proj_Ctrl/
├── frontend/          # Next.js frontend application
├── backend/           # Elysia.js backend API
├── prisma/           # Database schema and migrations
├── docker/           # Docker configuration
└── package.json      # Root package.json with scripts
```

## Prerequisites

- Node.js (v22.16.0+)
- Bun (v1.2.16+)
- Docker (v28.1.1+)
- npm (v10.9.2+)

## Setup Instructions

### 1. Database Setup

Start PostgreSQL using Docker:

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Database Migration

Run Prisma migrations to set up the database schema:

```bash
npm run db:migrate
```

### 3. Install Dependencies

Install frontend dependencies:

```bash
cd frontend && npm install
```

Backend dependencies are managed by Bun and should already be installed.

### 4. Environment Variables

The project uses the following environment variables (already configured):

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend

## Available Scripts

### Quick Start

- `./start-project.sh` - **One-command startup** (starts everything)
- `./stop-project.sh` - Stop all services gracefully
- `./test-setup.sh` - Verify system components

### Development

- `npm run dev` - Start both frontend and backend concurrently
- `npm run dev:frontend` - Start only the Next.js frontend (port 3000)
- `npm run dev:backend` - Start only the Elysia.js backend (port 8000)

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

### Production

- `npm run build` - Build the Next.js frontend

## Database Schema

The application includes models for:

- **Users**: Admin, Faculty, and Student roles
- **Teams**: Student team management
- **Projects**: Project details with domains and tech stacks
- **Assessments**: Faculty assessment system
- **Announcements**: System announcements
- **Reports**: Project reporting system

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/projects` - Get all projects
- `GET /api/teams` - Get all teams
- `GET /api/domains` - Get all domains
- `GET /api/technologies` - Get all technologies

## Features

- ✅ Next.js frontend with Tailwind CSS
- ✅ Elysia.js backend with CORS support
- ✅ PostgreSQL database with Prisma ORM
- ✅ TypeScript support throughout
- ✅ Docker containerization for database
- ✅ Full-stack API integration
- ✅ Responsive design with Tailwind CSS

## Getting Started

### 🚀 One-Command Startup (Recommended)

```bash
./start-project.sh
```

This script will:
- Check all prerequisites
- Start PostgreSQL database
- Install dependencies if needed
- Run database migrations
- Start both frontend and backend
- Display all service URLs and endpoints
- Monitor services for health

### 🛑 Stop All Services

```bash
./stop-project.sh
```

### Manual Setup (Alternative)

1. Start the database:
   ```bash
   docker compose -f docker/docker-compose.yml up -d
   ```

2. Run database migrations:
   ```bash
   npm run db:migrate
   ```

3. Start the development servers:
   ```bash
   npm run dev
   ```

4. Visit http://localhost:3000 to see the frontend
5. Backend API is available at http://localhost:8000

## Testing the Setup

The frontend includes a test page that:
- Checks backend connectivity
- Displays current users from the database
- Allows creating test users
- Shows the complete tech stack

## Troubleshooting

- **Port 5432 already in use**: PostgreSQL is already running, which is expected
- **Database connection issues**: Ensure Docker is running and PostgreSQL container is up
- **Frontend API errors**: Make sure backend is running on port 8000
