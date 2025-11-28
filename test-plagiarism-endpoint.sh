#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Testing Plagiarism Detection Service    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s http://localhost:5001/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "$HEALTH" | python3 -m json.tool
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test 2: Check if we have a sample PDF
echo -e "\n${YELLOW}Test 2: Plagiarism Check Endpoint${NC}"

# Look for any PDF in the current directory or create a simple text file
if [ ! -f "test_sample.pdf" ]; then
    echo -e "${YELLOW}No test PDF found. Creating a simple test file...${NC}"
    
    # Create a simple text file that we'll pretend is a PDF for testing
    # In production, you'd use a real PDF
    echo "This is a test SRS document for plagiarism checking." > test_sample.txt
    
    echo -e "${YELLOW}Note: For a real test, please provide a PDF file${NC}"
    echo -e "${YELLOW}You can test with: curl -X POST http://localhost:5001/check-plagiarism -F 'file=@your_file.pdf'${NC}"
else
    echo -e "${GREEN}Found test PDF: test_sample.pdf${NC}"
    
    echo -e "${YELLOW}Sending request to plagiarism checker...${NC}"
    RESPONSE=$(curl -s -X POST http://localhost:5001/check-plagiarism \
        -F "file=@test_sample.pdf" \
        -H "Accept: application/json")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Request successful${NC}"
        echo "$RESPONSE" | python3 -m json.tool
    else
        echo -e "${RED}❌ Request failed${NC}"
        exit 1
    fi
fi

echo -e "\n${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Service Information                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Service URL:${NC}      http://localhost:5001"
echo -e "${GREEN}Health Check:${NC}     http://localhost:5001/health"
echo -e "${GREEN}Plagiarism API:${NC}   POST http://localhost:5001/check-plagiarism"

echo -e "\n${YELLOW}📝 Example Usage:${NC}"
echo -e "${BLUE}curl -X POST http://localhost:5001/check-plagiarism \\${NC}"
echo -e "${BLUE}  -F 'file=@your_srs.pdf' \\${NC}"
echo -e "${BLUE}  -H 'Accept: application/json'${NC}"

echo -e "\n${YELLOW}📊 View Logs:${NC}"
echo -e "${BLUE}docker logs plagiarism-service${NC}"

echo -e "\n${GREEN}✨ Service is ready for integration! 🚀${NC}\n"

