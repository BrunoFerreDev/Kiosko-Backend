# Stage 1: Build
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Copiar Maven Wrapper y pom.xml para cachear dependencias
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar codigo fuente y compilar JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copiar el JAR generado desde la etapa de build
COPY --from=build /app/target/*.jar app.jar

# Railway asigna dinámicamente el puerto en la variable $PORT
ENV PORT=8080
EXPOSE ${PORT}

# Ejecutar la aplicación Spring Boot pasando el puerto de Railway
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
