# API Gateway Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared ./shared

# Copy package files
COPY api-gateway/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY api-gateway/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the service
CMD ["npm", "start"]
