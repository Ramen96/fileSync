FROM node:22-alpine

# Install required system dependencies
RUN apk add --no-cache \
    postgresql-client \
    openssl \
    curl

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema and migration files
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build the React application
RUN npm run build

# Create directories for file sync data
RUN mkdir -p /app/data /app/uploads

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S filesync -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R filesync:nodejs /app

# Switch to non-root user
USER filesync

# Expose ports for main app and WebSocket server
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Start script that runs migrations and starts both servers
CMD ["./start.sh"]