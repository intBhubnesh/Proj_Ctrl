#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   BRAINFLOW - Docker Startup Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create a .env file with required environment variables${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Checking environment variables...${NC}"
source .env

# Check required variables
REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET" "OPENAI_API" "PINECONE_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "   - $var"
    done
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables are set${NC}\n"

# Stop any running containers
echo -e "${YELLOW}🛑 Stopping any running containers...${NC}"
docker-compose down

# Build and start services
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker images built successfully${NC}\n"

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Services started successfully${NC}\n"

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 5

# Check service health
echo -e "\n${BLUE}📊 Service Status:${NC}"
docker-compose ps

# Test plagiarism service
echo -e "\n${YELLOW}🧪 Testing Plagiarism Service...${NC}"
for i in {1..10}; do
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Plagiarism service is healthy${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Plagiarism service failed to start${NC}"
        echo -e "${YELLOW}Check logs with: docker-compose logs plagiarism-checker${NC}"
    else
        echo -e "${YELLOW}   Waiting... ($i/10)${NC}"
        sleep 3
    fi
done

echo -e "\n${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Services are running!             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}🌐 Frontend:${NC}           http://localhost:3000"
echo -e "${GREEN}🔍 Plagiarism Service:${NC} http://localhost:5000"
echo -e "${GREEN}🗄️  PostgreSQL:${NC}        localhost:5432"

echo -e "\n${YELLOW}📝 Useful Commands:${NC}"
echo -e "   View logs:        ${BLUE}docker-compose logs -f${NC}"
echo -e "   Stop services:    ${BLUE}docker-compose down${NC}"
echo -e "   Restart service:  ${BLUE}docker-compose restart <service-name>${NC}"
echo -e "   View status:      ${BLUE}docker-compose ps${NC}"

echo -e "\n${GREEN}✨ Setup complete! Happy coding! 🚀${NC}\n"

