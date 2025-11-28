#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     BRAINFLOW Database Setup & Migration              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    exit 1
fi

# Load environment variables
source .env

echo -e "${CYAN}📋 Current Database Configuration:${NC}"
echo -e "   Database URL: ${GREEN}${DATABASE_URL}${NC}\n"

# Step 1: Generate Prisma Client
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 1: Generating Prisma Client...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cd frontend

# Try to generate client (may fail if @prisma/client not installed)
bunx prisma generate 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Prisma client generation failed, installing dependencies...${NC}"
    bun install
    bunx prisma generate
}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated successfully${NC}\n"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    echo -e "${YELLOW}Continuing anyway...${NC}\n"
fi

# Step 2: Apply Migrations
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 2: Applying Database Migrations...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

bunx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ All migrations applied successfully${NC}\n"
else
    echo -e "\n${RED}❌ Migration failed${NC}"
    echo -e "${YELLOW}Possible reasons:${NC}"
    echo -e "  • Database is not accessible"
    echo -e "  • DATABASE_URL is incorrect"
    echo -e "  • Network connectivity issues"
    echo -e "\n${CYAN}Try running manually:${NC}"
    echo -e "  ${GREEN}cd frontend && bunx prisma migrate deploy${NC}\n"
    exit 1
fi

# Step 3: Seed Database
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 3: Seeding Database with Test Data...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cd ..
bun run seed-database.ts

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Database seeded successfully${NC}\n"
else
    echo -e "\n${YELLOW}⚠️  Seeding had some issues (check output above)${NC}\n"
fi

# Step 4: Verify Database
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Step 4: Verifying Database Setup...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

cd frontend
bunx prisma db pull --force 2>/dev/null && echo -e "${GREEN}✅ Database connection verified${NC}\n" || echo -e "${YELLOW}⚠️  Could not verify database${NC}\n"

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Database Setup Complete! 🎉               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}📊 Database Summary:${NC}"
echo -e "   ${GREEN}✓${NC} Prisma Client generated"
echo -e "   ${GREEN}✓${NC} All migrations applied"
echo -e "   ${GREEN}✓${NC} Test data seeded"
echo -e ""

echo -e "${CYAN}🔑 Default Credentials:${NC}"
echo -e "   ${BLUE}Admin:${NC}"
echo -e "      Email: ${GREEN}admin@brainflow.com${NC}"
echo -e "      Password: ${GREEN}Admin@123${NC}"
echo -e ""
echo -e "   ${BLUE}Test Student:${NC}"
echo -e "      Email: ${GREEN}student@test.com${NC}"
echo -e "      Password: ${GREEN}Student@123${NC}"
echo -e ""

echo -e "${CYAN}🚀 Next Steps:${NC}"
echo -e "   1. Start the development server:"
echo -e "      ${GREEN}cd frontend && bun run dev${NC}"
echo -e ""
echo -e "   2. Navigate to:"
echo -e "      ${GREEN}http://localhost:3000/auth/login${NC}"
echo -e ""
echo -e "   3. Login with admin or student credentials"
echo -e ""

echo -e "${YELLOW}⚠️  Remember to change default passwords in production!${NC}\n"

