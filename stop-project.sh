#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if port_in_use $1; then
        print_status "Stopping service on port $1..."
        lsof -ti:$1 | xargs kill -TERM 2>/dev/null || true
        
        # Wait up to 10 seconds for graceful shutdown
        for i in {1..10}; do
            if ! port_in_use $1; then
                print_success "Service on port $1 stopped gracefully"
                return
            fi
            sleep 1
        done
        
        # Force kill if still running
        print_warning "Force killing process on port $1..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        
        if ! port_in_use $1; then
            print_success "Service on port $1 force stopped"
        fi
    else
        print_status "No service running on port $1"
    fi
}

clear
print_header "🛑 Stopping Project Control System"
print_header "=================================="
echo ""

print_status "Stopping application services..."

# Stop frontend (Next.js on port 3000)
kill_port 3000

# Stop backend (Elysia.js on port 8000)  
kill_port 8000

# Optional: Stop PostgreSQL (uncomment if you want to stop the database too)
# print_status "Stopping PostgreSQL database..."
# docker compose -f docker/docker-compose.yml down

print_header "\n✅ All services stopped successfully!"
print_header "===================================="
echo ""
print_status "To start the project again, run: ./start-project.sh"
echo ""
