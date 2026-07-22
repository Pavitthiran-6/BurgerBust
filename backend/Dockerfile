FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
RUN mvn --batch-mode --no-transfer-progress -DskipTests dependency:go-offline
COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21-jre-jammy
RUN groupadd --system burgerburst && useradd --system --gid burgerburst --home-dir /app burgerburst
WORKDIR /app
COPY --from=build --chown=burgerburst:burgerburst /workspace/target/burgerburst-backend-0.0.1-SNAPSHOT.jar app.jar
USER burgerburst
EXPOSE 8080
ENTRYPOINT ["java","-XX:MaxRAMPercentage=75.0","-Djava.security.egd=file:/dev/urandom","-jar","/app/app.jar"]
