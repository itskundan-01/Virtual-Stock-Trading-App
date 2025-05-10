#!/bin/bash

# Deployment script for Mahalaxya API
echo "===== Starting Mahalaxya API deployment at $(date) ====="

# Ensure we're in the server directory
SERVER_DIR="$HOME/Virtual-Stock-Trading-App/server"
if [ ! -d "$SERVER_DIR" ]; then
  echo "Error: Server directory not found at $SERVER_DIR"
  echo "Creating directory structure..."
  mkdir -p "$SERVER_DIR"
fi

cd "$SERVER_DIR" || { echo "Failed to change to server directory"; exit 1; }

# Set production environment variables
echo "Setting environment variables..."
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET=${JWT_SECRET:-"MahaLakshya_JWT_Secret_Key_2025_Secure_Token_Auth"}
export ADMIN_KEY=${ADMIN_KEY:-"MahaLakshya_Admin_Registration_Key_2025"}
export CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-"https://mahalaxya.kundanprojects.space,http://mahalaxya.kundanprojects.space"}
export CORS_ALLOWED_METHODS=${CORS_ALLOWED_METHODS:-"GET,POST,PUT,DELETE,OPTIONS"}
export CORS_ALLOWED_HEADERS=${CORS_ALLOWED_HEADERS:-"Authorization,Content-Type,X-Requested-With,Accept"}
export CORS_EXPOSED_HEADERS=${CORS_EXPOSED_HEADERS:-"Authorization"}
export CLIENT_APP_URL=${CLIENT_APP_URL:-"https://mahalaxya.kundanprojects.space"}

# Check if Maven wrapper exists, if not download it
if [ ! -f "./mvnw" ]; then
  echo "Maven wrapper not found. Downloading..."
  curl -o maven-wrapper.jar https://repo1.maven.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
  # Create mvnw script
  printf "#!/bin/sh\nJAVA_HOME=\${JAVA_HOME:-\"/usr/lib/jvm/java-21-amazon-corretto\"}\nexec java -jar \"\$(dirname \"\$0\")/maven-wrapper.jar\" \"\$@\"\n" > mvnw
  chmod +x mvnw
fi

# Make the Maven wrapper executable
chmod +x ./mvnw

# Check for Java installation
if ! command -v java &> /dev/null; then
  echo "Java not found. Please install Java 21."
  exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed 's/^1\.//' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
  echo "Java version $JAVA_VERSION detected. This application requires Java 17 or higher."
  exit 1
fi

echo "Java version: $(java -version 2>&1 | head -1)"

# Create logs directory if it doesn't exist
mkdir -p logs

# Build the JAR file
echo "Building application..."
./mvnw clean package -DskipTests || { echo "Build failed"; exit 1; }

# Check if JAR was created successfully
if [ ! -f "target/server-0.0.1-SNAPSHOT.jar" ]; then
  echo "Error: JAR file not found after build"
  exit 1
fi

# Stop any running instance
if [ -f app.pid ]; then
  PID=$(cat app.pid)
  if ps -p $PID &> /dev/null; then
    echo "Stopping existing application instance (PID: $PID)"
    kill $PID
    sleep 5
    # Force kill if still running
    if ps -p $PID &> /dev/null; then
      echo "Application still running, force killing..."
      kill -9 $PID
    fi
  else
    echo "No running instance found with PID $PID"
  fi
  rm app.pid
fi

# Run the application with production profile
echo "Starting the application..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="logs/app_${TIMESTAMP}.log"

# Add debug options to see exactly what properties Spring is using
JAVA_OPTS="-Dspring.profiles.active=prod -Dlogging.level.org.springframework=INFO -Dlogging.level.com.tradingsim=INFO"

nohup java $JAVA_OPTS \
  -Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect \
  -Dcors.allowed-origins="$CORS_ALLOWED_ORIGINS" \
  -Dcors.allowed-methods="$CORS_ALLOWED_METHODS" \
  -Dcors.allowed-headers="$CORS_ALLOWED_HEADERS" \
  -Dcors.exposed-headers="$CORS_EXPOSED_HEADERS" \
  -jar target/server-0.0.1-SNAPSHOT.jar > "$LOG_FILE" 2>&1 &

APP_PID=$!
echo $APP_PID > app.pid

# Check if application started successfully
sleep 15
if ps -p $APP_PID &> /dev/null; then
  echo "===== Mahalaxya API successfully started on http://mahalaxya-api.kundanprojects.space ====="
  echo "PID: $APP_PID"
  echo "Log file: $LOG_FILE"
  echo "Deployment completed at $(date)"
  
  # Create symlink to latest log
  ln -sf "$LOG_FILE" logs/latest.log
  echo "To view logs: tail -f logs/latest.log"
else
  echo "===== ERROR: Application failed to start ====="
  echo "Check logs at $LOG_FILE"
  cat "$LOG_FILE"
  exit 1
fi