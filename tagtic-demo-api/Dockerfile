FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/*.jar tagtic.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","tagtic.jar"]