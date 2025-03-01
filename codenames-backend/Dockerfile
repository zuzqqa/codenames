# Use Eclipse Temurin JDK 17 as the base image
FROM eclipse-temurin:17.0.6_10-jdk

# Metadata labels for the container image
LABEL org.opencontainers.image.title="codenames-backend"
LABEL org.opencontainers.image.authors="Codenames"
LABEL org.opencontainers.image.version="0.0.1-SNAPSHOT"
LABEL org.opencontainers.image.description="Spring Boot backend for Codenames app"

# Set the working directory inside the container
WORKDIR /opt/codenames-backend

# Update package lists and install Maven
RUN apt-get update && apt-get install -y maven

# Copy the Maven POM file for dependency resolution
COPY pom.xml ./

# Copy the application source code
COPY src ./src

# Pre-download dependencies to speed up build times
RUN mvn dependency:go-offline

# Expose port 8080 for the application
EXPOSE 8080

# Command to start the Spring Boot application
CMD ["mvn", "spring-boot:run"]