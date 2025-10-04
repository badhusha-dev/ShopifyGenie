# Generic Dockerfile for ShopifyGenie microservices
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared dependencies
COPY shared ./shared

# Copy package files
COPY services/auth-service/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY services/auth-service/ .

# Copy tsconfig.json
COPY services/auth-service/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE ${SERVICE_PORT:-5001}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${SERVICE_PORT:-5001}/health || exit 1

# Start the service
CMD ["npm", "start"]
