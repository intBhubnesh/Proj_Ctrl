#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Cleanup function for graceful shutdown
cleanup() {
    print_header "\n🛑 Shutting down services..."
    
    # Kill processes on our ports
    kill_port 3000  # Frontend
    kill_port 8000  # Backend
    
    print_success "All services stopped."
    exit 0
}

# Set up signal handlers for graceful shutdown
trap cleanup SIGINT SIGTERM

clear
print_header "🚀 Starting Project Control System"
print_header "=================================="
echo ""

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists bun; then
    print_error "Bun is not installed. Please install Bun first."
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "All prerequisites are installed."

# Step 2: Start PostgreSQL
print_status "Starting PostgreSQL database..."

if docker ps | grep -q postgres; then
    print_success "PostgreSQL is already running."
else
    print_status "Starting PostgreSQL container..."
    if docker compose -f docker/docker-compose.yml up -d; then
        print_success "PostgreSQL started successfully."
        sleep 3  # Give PostgreSQL time to fully start
    else
        print_error "Failed to start PostgreSQL."
        exit 1
    fi
fi

# Step 3: Generate Prisma client if needed
print_status "Checking Prisma client..."

if [ ! -d "node_modules/@prisma/client" ]; then
    print_warning "Prisma client not found. Generating..."
    if npm run db:generate; then
        print_success "Prisma client generated."
    else
        print_error "Failed to generate Prisma client."
        exit 1
    fi
else
    print_success "Prisma client is available."
fi

# Step 4: Install frontend dependencies if needed
print_status "Checking frontend dependencies..."

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd frontend
    if npm install; then
        print_success "Frontend dependencies installed."
    else
        print_error "Failed to install frontend dependencies."
        exit 1
    fi
    cd ..
else
    print_success "Frontend dependencies are installed."
fi

# Step 5: Run database migrations
print_status "Checking database schema..."

# Check if migrations have been run
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations)" ]; then
    print_warning "Running database migrations..."
    if npm run db:migrate; then
        print_success "Database migrations completed."
    else
        print_error "Failed to run database migrations."
        exit 1
    fi
else
    print_success "Database schema is up to date."
fi

# Step 6: Clean up any processes on our ports
print_status "Preparing ports..."
kill_port 3000
kill_port 8000

# Step 7: Start the services
print_header "\n🎯 Starting application services..."

# Create log directory
mkdir -p logs

# Start backend in background
print_status "Starting Elysia.js backend (port 8000)..."
cd backend
bun run index.ts > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if port_in_use 8000; then
    print_success "Backend started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check logs/backend.log for details."
    cat logs/backend.log
    exit 1
fi

# Start frontend in background
print_status "Starting Next.js frontend (port 3000)..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
for i in {1..30}; do
    if port_in_use 3000; then
        print_success "Frontend started successfully (PID: $FRONTEND_PID)"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        print_error "Frontend failed to start within 30 seconds. Check logs/frontend.log for details."
        tail -20 logs/frontend.log
        cleanup
        exit 1
    fi
done

# Step 8: Display success message and URLs
print_header "\n✅ Project Control System is now running!"
print_header "========================================="
echo ""
print_success "🌐 Frontend:  http://localhost:3000"
print_success "🔧 Backend:   http://localhost:8000"
print_success "🗄️  Database: postgresql://admin:password@localhost:5432/college_db"
echo ""
print_header "📋 Available endpoints:"
echo "  • GET  /api/health      - Backend health check"
echo "  • GET  /api/users       - List all users"
echo "  • POST /api/users       - Create new user"
echo "  • GET  /api/projects    - List all projects"
echo "  • GET  /api/teams       - List all teams"
echo "  • GET  /api/domains     - List all domains"
echo "  • GET  /api/technologies- List all technologies"
echo ""
print_header "🔧 Management commands:"
echo "  • npm run db:studio     - Open Prisma Studio (database GUI)"
echo "  • ./test-setup.sh       - Test system components"
echo ""
print_warning "Press Ctrl+C to stop all services"
echo ""

# Step 9: Monitor services and wait
print_status "Monitoring services... (logs available in ./logs/)"

# Function to check service health
check_services() {
    local services_ok=true
    
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Backend process died unexpectedly"
        services_ok=false
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_error "Frontend process died unexpectedly"
        services_ok=false
    fi
    
    if ! port_in_use 8000; then
        print_error "Backend is not responding on port 8000"
        services_ok=false
    fi
    
    if ! port_in_use 3000; then
        print_error "Frontend is not responding on port 3000"
        services_ok=false
    fi
    
    if [ "$services_ok" = false ]; then
        print_error "Service failure detected. Shutting down..."
        cleanup
        exit 1
    fi
}

# Monitor services every 30 seconds
while true; do
    sleep 30
    check_services
done
