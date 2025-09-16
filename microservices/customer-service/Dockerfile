FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Bring in shared-library and install to local Maven repo
COPY shared-library /shared-library
RUN mvn -f /shared-library/pom.xml clean install -DskipTests

# Copy pom.xml first for better caching
COPY customer-service/pom.xml ./

# Copy source code
COPY customer-service/src src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8082

# Run the application
CMD ["java", "-jar", "target/customer-service-1.0.0.jar"]
