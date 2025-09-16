FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Bring in shared-library and install to local Maven repo
COPY shared-library /shared-library
RUN mvn -f /shared-library/pom.xml clean install -DskipTests

# Copy pom.xml first for better caching
COPY api-gateway/pom.xml ./

# Copy source code
COPY api-gateway/src src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/api-gateway-1.0.0.jar"]
