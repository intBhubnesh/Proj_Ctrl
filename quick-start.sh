#!/bin/bash

# BrainFlow Quick Start Script
# This script helps you get the project running quickly

set -e  # Exit on error

echo "🚀 BrainFlow Quick Start"
echo "======================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your credentials:"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - NEXTAUTH_SECRET (generate a random string)"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

echo "📦 Building and starting containers..."
echo ""

# Stop any existing containers
docker compose down 2>/dev/null || true

# Build and start containers
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    echo ""

    # Initialize database
    echo "🗄️  Initializing database..."
    echo ""

    echo "Generating Prisma Client..."
    docker compose exec -T frontend bunx prisma generate || true

    echo "Pushing schema to database..."
    docker compose exec -T frontend bunx prisma db push --accept-data-loss || true

    echo "Seeding database..."
    docker compose exec -T frontend bun run prisma/seed.ts || true

    echo ""
    echo "✅ Database initialized!"
    echo ""
    echo "🎉 BrainFlow is ready!"
    echo ""
    echo "📍 Access the application:"
    echo "   - Landing Page:  http://localhost:3000"
    echo "   - Login Page:    http://localhost:3000/auth/login"
    echo "   - Backend API:   http://localhost:8000"
    echo "   - Plagiarism:    http://localhost:5001"
    echo ""
    echo "🔑 Default Credentials (after seeding):"
    echo "   Admin:    admin@college.edu / admin123"
    echo "   Teacher:  teacher@college.edu / teacher123"
    echo "   Student:  student@college.edu / student123"
    echo ""
    echo "📝 View logs with: docker compose logs -f"
    echo "🛑 Stop with: docker compose down"
    echo ""
else
    echo "❌ Services failed to start!"
    echo ""
    echo "View logs with: docker compose logs"
    exit 1
fi
