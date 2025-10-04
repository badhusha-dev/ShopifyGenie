# Accounting Service Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy shared dependencies
COPY shared ./shared

# Copy package files
COPY services/accounting-service/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY services/accounting-service/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5005

# Start the service
CMD ["npm", "start"]
