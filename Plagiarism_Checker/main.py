from dotenv import load_dotenv
import os
import fitz
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import logging
from typing import Optional
import hashlib
import json
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Simple file-based storage for documents
STORAGE_DIR = Path("/app/storage")
STORAGE_DIR.mkdir(exist_ok=True)
DOCUMENTS_FILE = STORAGE_DIR / "documents.json"

# Initialize document storage
if not DOCUMENTS_FILE.exists():
    DOCUMENTS_FILE.write_text("[]")
    logger.info("Initialized document storage")

def load_documents():
    """Load stored documents from JSON file."""
    try:
        with open(DOCUMENTS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load documents: {e}")
        return []

def save_documents(documents):
    """Save documents to JSON file."""
    try:
        with open(DOCUMENTS_FILE, 'w') as f:
            json.dump(documents, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save documents: {e}")

def calculate_text_hash(text: str) -> str:
    """Calculate SHA256 hash of text."""
    return hashlib.sha256(text.encode()).hexdigest()

def extract_key_sections(text: str) -> str:
    """
    Extract key sections from SRS document.
    This is a simplified version that just cleans the text.
    """
    # Remove excessive whitespace
    text = ' '.join(text.split())
    # Take first 5000 characters for comparison (to avoid memory issues)
    return text[:5000]

def extract_full_pdf_text(file_bytes: bytes) -> str:
    """
    Extract text from PDF bytes with error handling.

    Args:
        file_bytes: PDF file bytes

    Returns:
        Extracted text string

    Raises:
        HTTPException: If PDF extraction fails
    """
    try:
        pdf_stream = io.BytesIO(file_bytes)
        doc = fitz.open(stream=pdf_stream, filetype="pdf")

        if doc.page_count == 0:
            doc.close()  # Don't forget to close the document
            raise HTTPException(status_code=400, detail="PDF file contains no pages")

        text = "\n".join([page.get_text("text") for page in doc])
        doc.close()

        # This check should come BEFORE the general exception handler
        if not text.strip():
            raise HTTPException(status_code=400, detail="PDF file contains no extractable text")

        return text

    except HTTPException:
        # Re-raise HTTP exceptions (including the one we just created above)
        raise
    except fitz.FileDataError as e:
        raise HTTPException(status_code=400, detail="Invalid PDF file format")
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract text from PDF")


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file.

    Args:
        file: Uploaded file

    Raises:
        HTTPException: If file validation fails
    """
    # Check file size (10MB limit)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size too large (max 10MB)")

    # Check file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # Check content type
    if file.content_type and file.content_type not in ['application/pdf']:
        raise HTTPException(status_code=400, detail="Invalid content type. Expected application/pdf")

def calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate cosine similarity between two texts using TF-IDF.

    Args:
        text1: First text
        text2: Second text

    Returns:
        Similarity score between 0 and 1
    """
    try:
        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except Exception as e:
        logger.error(f"Similarity calculation failed: {e}")
        return 0.0

app = FastAPI(
    title="Plagiarism Detection API",
    description="API for detecting plagiarism in SRS documents",
    version="1.0.0"
)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Plagiarism detection service is running"}

@app.post("/check-plagiarism")
async def check_plagiarism(file: UploadFile = File(...)):
    """
    Check for plagiarism in uploaded PDF document.

    Args:
        file: PDF file to check

    Returns:
        JSON response with plagiarism detection results
    """
    try:
        # Validate file
        validate_file(file)

        # Read file
        file_bytes = await file.read()
        logger.info(f"Processing file: {file.filename}, size: {len(file_bytes)} bytes")

        # Extract text from PDF
        full_text = extract_full_pdf_text(file_bytes)

        # Extract key sections and calculate hash
        processed_text = extract_key_sections(full_text)
        text_hash = calculate_text_hash(processed_text)

        # Load existing documents
        documents = load_documents()

        # Check for exact duplicate first
        for doc in documents:
            if doc.get("hash") == text_hash:
                logger.warning(f"Exact duplicate found: {file.filename} matches {doc.get('filename')}")
                return JSONResponse({
                    "plagiarism_detected": True,
                    "max_score": 1.0,
                    "matched_files": [doc.get("filename")],
                    "threshold": 0.60,
                    "document_added": False,
                    "message": "Exact duplicate detected"
                })

        # Calculate similarity with existing documents
        plagiarism_detected = False
        matched_files = []
        max_score = 0.0
        threshold = 0.60  # 60% threshold as per requirements

        for doc in documents:
            similarity = calculate_similarity(processed_text, doc.get("text", ""))
            logger.info(f"Similarity with {doc.get('filename')}: {similarity:.4f}")

            if similarity > max_score:
                max_score = similarity

            if similarity >= threshold:
                plagiarism_detected = True
                if doc.get("filename") not in matched_files:
                    matched_files.append(doc.get("filename"))

        # Add document to storage if no plagiarism detected
        if not plagiarism_detected:
            new_doc = {
                "filename": file.filename,
                "text": processed_text,
                "hash": text_hash,
                "file_size": len(file_bytes)
            }
            documents.append(new_doc)
            save_documents(documents)
            logger.info(f"Added document to storage: {file.filename}")

        # Prepare response
        response_data = {
            "plagiarism_detected": plagiarism_detected,
            "max_score": round(max_score, 4),
            "matched_files": matched_files,
            "threshold": threshold,
            "document_added": not plagiarism_detected
        }

        logger.info(f"Plagiarism check completed for {file.filename}: {response_data}")
        return JSONResponse(response_data)

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.exception_handler(413)
async def file_too_large_handler(request, exc):
    """Handle file too large errors."""
    return JSONResponse(
        status_code=413,
        content={"detail": "File too large"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
