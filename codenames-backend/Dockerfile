FROM eclipse-temurin:17.0.6_10-jdk

LABEL org.opencontainers.image.title="codenames-backend"
LABEL org.opencontainers.image.authors="Codenames"
LABEL org.opencontainers.image.version="0.0.1-SNAPSHOT"
LABEL org.opencontainers.image.description="Spring Boot backend for Codenames app"

WORKDIR /opt/codenames-backend
RUN apt-get update && apt-get install -y maven

COPY pom.xml ./
COPY src ./src
RUN mvn dependency:go-offline

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]