# Analytics Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared ./shared

# Copy package files
COPY services/analytics-service/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY services/analytics-service/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5006

# Start the service
CMD ["npm", "start"]
