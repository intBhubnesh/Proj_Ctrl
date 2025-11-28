#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Testing Plagiarism Detection Service${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Test 2: Check Plagiarism Endpoint${NC}"
echo "Creating a sample PDF for testing..."

# Create a simple test PDF using Python
python3 << 'EOF'
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

# Create test PDF
pdf_path = "/tmp/test_srs.pdf"
c = canvas.Canvas(pdf_path, pagesize=letter)
c.setFont("Helvetica", 12)

# Add content
c.drawString(100, 750, "Software Requirements Specification")
c.drawString(100, 730, "")
c.drawString(100, 710, "1.1 Purpose")
c.drawString(100, 690, "This project aims to create a student management system")
c.drawString(100, 670, "for tracking academic progress and project submissions.")
c.drawString(100, 650, "")
c.drawString(100, 630, "1.4 Product Scope")
c.drawString(100, 610, "The system will provide features for student registration,")
c.drawString(100, 590, "team formation, and project submission with plagiarism detection.")
c.drawString(100, 570, "")
c.drawString(100, 550, "2.1 Product Perspective")
c.drawString(100, 530, "This is a web-based application using React and Node.js")
c.drawString(100, 510, "")
c.drawString(100, 490, "2.2 Product Functions")
c.drawString(100, 470, "- User authentication via Google OAuth")
c.drawString(100, 450, "- Team creation and management")
c.drawString(100, 430, "- Project submission and review")
c.drawString(100, 410, "")
c.drawString(100, 390, "4.1 System Features")
c.drawString(100, 370, "- Real-time plagiarism detection using AI")
c.drawString(100, 350, "- Admin dashboard for monitoring submissions")
c.drawString(100, 330, "- Export functionality for reports")

c.save()
print(f"✅ Test PDF created at: {pdf_path}")
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test PDF created successfully${NC}\n"
    
    # Test plagiarism check
    echo -e "${YELLOW}Sending PDF to plagiarism checker...${NC}"
    PLAGIARISM_RESPONSE=$(curl -s -X POST http://localhost:5000/check-plagiarism \
        -F "file=@/tmp/test_srs.pdf" \
        -H "Accept: application/json")
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Plagiarism check completed${NC}"
        echo "Response:"
        echo "$PLAGIARISM_RESPONSE" | python3 -m json.tool
        
        # Check if response contains expected fields
        if echo "$PLAGIARISM_RESPONSE" | grep -q "plagiarism_detected"; then
            echo -e "\n${GREEN}✅ All tests passed!${NC}"
        else
            echo -e "\n${RED}❌ Response missing expected fields${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Plagiarism check failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to create test PDF${NC}"
    exit 1
fi

# Cleanup
rm -f /tmp/test_srs.pdf
echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"

