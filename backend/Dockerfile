FROM oven/bun:1 AS base
WORKDIR /app

# Copy package files from backend directory
COPY backend/package.json backend/bun.lock* ./

# Copy prisma schema from root
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma Client
RUN bunx prisma generate

# Copy backend source code
COPY backend/*.ts ./

# Expose port
EXPOSE 8000

# Start the server
CMD ["bun", "run", "index.ts"]
