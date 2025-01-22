# Use the official Eclipse Temurin image as the base image
FROM eclipse-temurin:17.0.6_10-jre

# Set the labels for the image
LABEL org.opencontainers.image.title="codenames-spring-backend"
LABEL org.opencontainers.image.authors="Jakub Walasik"
LABEL org.opencontainers.image.version="0.0.1-SNAPSHOT"

# Set environment variables
ENV VERSION="0.0.1-SNAPSHOT"
ENV SERVER_PORT=8080

# Expose the application port
EXPOSE 8080

# Copy the jar file to the container
COPY target/Codenames-${VERSION}.jar /opt/codenames-backend/codenames-backend.jar

# Run the jar file
CMD ["java", "-jar", "/opt/codenames-backend/codenames-backend.jar"]
