#!/bin/bash

# Deployment script for Mahalaxya API
echo "Starting Mahalaxya API deployment..."

# Build the JAR file
./mvnw clean package -DskipTests

# Set production environment variables
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost  # Change to your actual DB host
export DB_PORT=3306
export DB_NAME=tradingsim
export DB_USERNAME=root  # Change to your secure username
export DB_PASSWORD=password  # Change to your secure password
export CORS_ALLOWED_ORIGINS=https://mahalaxya.kundanprojects.space
export CLIENT_APP_URL=https://mahalaxya.kundanprojects.space
export JWT_SECRET=your-secure-jwt-secret-key  # Change to your secure JWT secret
export ADMIN_KEY=your-secure-admin-key  # Change to your secure admin key

# Run the application with production profile
nohup java -jar target/server-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod > app.log 2>&1 &
echo $! > app.pid

echo "Mahalaxya API started on https://mahalaxya-api.kundanprojects.space"
echo "Check app.log for application logs"