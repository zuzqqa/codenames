FROM eclipse-temurin:17.0.6_10-jre

LABEL org.opencontainers.image.title="codenames-backend"
LABEL org.opencontainers.image.authors="Jakub Walasik"
LABEL org.opencontainers.image.version="0.0.1-SNAPSHOT"

LABEL build_version=""
LABEL maintainer=""

ENV VERSION="0.0.1-SNAPSHOT"
ENV SERVER_PORT=8080
ENV SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect
ENV SPRING_JPA_GENERATE_DDL=true
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
EXPOSE 8080

COPY target/Codenames-${VERSION}.jar /opt/codenames-backend/codenames-backend.jar

CMD ["java", "-jar", "/opt/codenames-backend/codenames-backend.jar"]
