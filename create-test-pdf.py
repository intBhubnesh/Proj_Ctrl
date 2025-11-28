#!/usr/bin/env python3
"""Create a test PDF for plagiarism checking."""

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

def create_test_pdf(filename="test_srs.pdf"):
    """Create a sample SRS PDF for testing."""
    pdf_path = filename
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    
    # Title
    c.drawString(100, 750, "Software Requirements Specification")
    
    c.setFont("Helvetica", 12)
    
    # 1.1 Purpose
    c.drawString(100, 720, "1.1 Purpose")
    c.setFont("Helvetica", 10)
    c.drawString(100, 700, "This project aims to create a comprehensive student management system")
    c.drawString(100, 685, "for tracking academic progress, team formation, and project submissions.")
    c.drawString(100, 670, "The system will help educational institutions manage student projects")
    c.drawString(100, 655, "with built-in plagiarism detection capabilities.")
    
    # 1.4 Product Scope
    c.setFont("Helvetica", 12)
    c.drawString(100, 630, "1.4 Product Scope")
    c.setFont("Helvetica", 10)
    c.drawString(100, 610, "The system will provide features for:")
    c.drawString(120, 595, "- Student registration and authentication via Google OAuth")
    c.drawString(120, 580, "- Team creation and management with department-based grouping")
    c.drawString(120, 565, "- Project submission with SRS document upload")
    c.drawString(120, 550, "- Automated plagiarism detection using AI technology")
    c.drawString(120, 535, "- Admin dashboard for monitoring all submissions")
    
    # 2.1 Product Perspective
    c.setFont("Helvetica", 12)
    c.drawString(100, 510, "2.1 Product Perspective")
    c.setFont("Helvetica", 10)
    c.drawString(100, 490, "This is a modern web-based application built using:")
    c.drawString(120, 475, "- Frontend: React with Next.js framework")
    c.drawString(120, 460, "- Backend: Node.js with TypeScript")
    c.drawString(120, 445, "- Database: PostgreSQL for data persistence")
    c.drawString(120, 430, "- Authentication: NextAuth.js with Google OAuth")
    c.drawString(120, 415, "- AI Services: OpenAI GPT-4 and Pinecone vector database")
    
    # 2.2 Product Functions
    c.setFont("Helvetica", 12)
    c.drawString(100, 390, "2.2 Product Functions")
    c.setFont("Helvetica", 10)
    c.drawString(100, 370, "Key functionalities include:")
    c.drawString(120, 355, "- User authentication and role-based access control")
    c.drawString(120, 340, "- Team creation with unique team codes")
    c.drawString(120, 325, "- Project submission with file upload")
    c.drawString(120, 310, "- Real-time plagiarism detection")
    c.drawString(120, 295, "- Admin analytics and reporting")
    
    # 4.1 System Features
    c.setFont("Helvetica", 12)
    c.drawString(100, 270, "4.1 System Features")
    c.setFont("Helvetica", 10)
    c.drawString(100, 250, "Advanced features:")
    c.drawString(120, 235, "- AI-powered plagiarism detection with 80% threshold")
    c.drawString(120, 220, "- Vector similarity search using embeddings")
    c.drawString(120, 205, "- Comprehensive admin dashboard with export capabilities")
    c.drawString(120, 190, "- Team validation to prevent duplicate memberships")
    c.drawString(120, 175, "- Automated document summarization")
    
    c.save()
    print(f"✅ Test PDF created: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    create_test_pdf()

