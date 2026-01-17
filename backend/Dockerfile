FROM eclipse-temurin:21-jdk AS builder

WORKDIR /workspace

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle

RUN chmod +x ./gradlew

# Warm up dependency cache
RUN ./gradlew --no-daemon dependencies > /dev/null || true

COPY src ./src

# Build runnable jar
RUN ./gradlew --no-daemon bootJar -x test


FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
