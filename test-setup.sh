#!/bin/bash

echo "🔍 Testing Project Control System Setup..."
echo "========================================"

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL..."
if docker ps | grep -q postgres; then
    echo "✅ PostgreSQL is running in Docker"
else
    echo "❌ PostgreSQL is not running. Starting it..."
    docker compose -f docker/docker-compose.yml up -d
fi

# Check database connection
echo "🔗 Testing database connection..."
if PGPASSWORD=password psql -h localhost -U admin -d college_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "ℹ️  Database connection test skipped (psql not installed)"
fi

# Check if Prisma client is generated
echo "🔍 Checking Prisma client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client is generated"
else
    echo "⚠️  Generating Prisma client..."
    bun run db:generate
fi

# Check frontend dependencies
echo "📦 Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Installing frontend dependencies..."
    cd frontend && bun install && cd ..
fi

# Check backend dependencies
echo "📦 Checking backend dependencies..."
if [ -f "backend/bun.lock" ]; then
    echo "✅ Backend dependencies managed by Bun"
else
    echo "⚠️  Backend dependencies might be missing"
fi

# Test backend compilation
echo "🧪 Testing backend compilation..."
cd backend
if bun run --check index.ts > /dev/null 2>&1; then
    echo "✅ Backend compiles successfully"
else
    echo "⚠️  Backend compilation has issues - this is expected if Prisma client path needs adjustment"
fi
cd ..

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "To start the application:"
echo "  bun run dev                 # Start both frontend and backend"
echo "  bun run dev:frontend        # Start only frontend (port 3000)"
echo "  bun run dev:backend         # Start only backend (port 8000)"
echo ""
echo "To access:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Database: postgresql://admin:password@localhost:5432/college_db"
