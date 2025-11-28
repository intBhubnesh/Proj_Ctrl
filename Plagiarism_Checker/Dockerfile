# Base image
FROM python:3.12-slim

# Working dir
WORKDIR /app

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy only necessary application files
COPY main.py .

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash appuser

# Create storage directory and set permissions
RUN mkdir -p /app/storage && chown -R appuser:appuser /app/storage

USER appuser

# Expose FastAPI port
EXPOSE 5000

# Environment variables should be set at runtime
ENV PYTHONUNBUFFERED=1

# Run with uvicorn on port 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
