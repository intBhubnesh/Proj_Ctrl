#!/bin/bash

# BrainFlow Local Development Start Script
# Run the project locally without Docker

set -e

echo "🚀 BrainFlow Local Development"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ No .env file found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "Install it from: https://bun.sh"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

echo "Installing root dependencies..."
bun install

echo "Installing frontend dependencies..."
cd frontend && bun install && cd ..

echo "Installing backend dependencies..."
cd backend && bun install && cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
bunx prisma generate
cd frontend && bunx prisma generate && cd ..

echo ""
echo "✅ Prisma Client generated"
echo ""

# Check if database is accessible
echo "🗄️  Checking database connection..."
if bunx prisma db push --accept-data-loss; then
    echo "✅ Database connected and schema pushed"
else
    echo "❌ Database connection failed!"
    echo "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    exit 1
fi

echo ""
echo "🌱 Seeding database..."
bun run db:seed || echo "⚠️  Seeding failed (might be already seeded)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Starting development servers..."
echo ""
echo "This will start:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start both frontend and backend
bun run dev
