#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     BRAINFLOW Admin User Seeding          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file with DATABASE_URL${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 This script will create:${NC}"
echo -e "  ${GREEN}✓${NC} Admin user (admin@brainflow.com)"
echo -e "  ${GREEN}✓${NC} Test student (student@test.com)"
echo -e ""

# Run Prisma generate first
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
cd frontend
bunx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# Run seed script
echo -e "${BLUE}🌱 Seeding database...${NC}"
bun run ../prisma/seed.ts

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          Seeding Successful! 🎉            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${BLUE}📧 Admin Credentials:${NC}"
    echo -e "   Email:    ${GREEN}admin@brainflow.com${NC}"
    echo -e "   Password: ${GREEN}Admin@123${NC}"
    echo -e ""
    
    echo -e "${BLUE}📧 Test Student Credentials:${NC}"
    echo -e "   Email:    ${GREEN}student@test.com${NC}"
    echo -e "   Password: ${GREEN}Student@123${NC}"
    echo -e ""
    
    echo -e "${YELLOW}⚠️  Remember to change these passwords in production!${NC}"
    echo -e ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo -e "   1. Start the dev server: ${GREEN}cd frontend && bun run dev${NC}"
    echo -e "   2. Navigate to: ${GREEN}http://localhost:3000/auth/login${NC}"
    echo -e "   3. Login with admin credentials"
    echo -e ""
else
    echo -e "\n${RED}╔════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          Seeding Failed! ❌                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════╝${NC}\n"
    
    echo -e "${YELLOW}Possible issues:${NC}"
    echo -e "  • Database is not accessible"
    echo -e "  • DATABASE_URL is incorrect"
    echo -e "  • Migration not applied"
    echo -e ""
    echo -e "${BLUE}Try running:${NC}"
    echo -e "  ${GREEN}cd frontend && bunx prisma migrate deploy${NC}"
    echo -e ""
    exit 1
fi

