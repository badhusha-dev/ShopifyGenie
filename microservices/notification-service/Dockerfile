FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Bring in shared-library and install to local Maven repo
COPY shared-library /shared-library
RUN mvn -f /shared-library/pom.xml clean install -DskipTests

# Copy pom.xml first for better caching
COPY notification-service/pom.xml ./

# Copy source code
COPY notification-service/src src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8085

# Run the application
CMD ["java", "-jar", "target/notification-service-0.0.1-SNAPSHOT.jar"]
