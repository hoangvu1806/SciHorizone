#!/bin/sh

# run.sh - Script to run Next.js application

# Configuration
PROD_PORT=4040
DEV_PORT=4041

# Default to production mode
MODE=${1:-prod}

# Display usage instructions
show_usage() {
  echo "📋 Usage: ./run.sh [MODE]"
  echo ""
  echo "MODES:"
  echo "  prod       - Production mode (default)"
  echo "  dev        - Development mode"
  echo ""
  echo "Examples:"
  echo "  ./run.sh         - Run in production mode"
  echo "  ./run.sh prod    - Run in production mode"
  echo "  ./run.sh dev     - Run in development mode"
}

# Check port availability
check_port() {
  PORT_TO_CHECK=$1
  if command -v lsof >/dev/null 2>&1; then
    if lsof -i :$PORT_TO_CHECK | grep LISTEN >/dev/null 2>&1; then
      echo "⚠️ WARNING: Port $PORT_TO_CHECK is already in use."
      return 1
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln | grep :$PORT_TO_CHECK >/dev/null 2>&1; then
      echo "⚠️ WARNING: Port $PORT_TO_CHECK is already in use."
      return 1
    fi
  fi
  return 0
}

# Handle signals to safely shut down
handle_sigterm() {
  echo "⚠️ Received SIGTERM, shutting down gracefully..."
  exit 0
}

# Register signal handler
trap handle_sigterm SIGTERM SIGINT

# Process parameters
case "$MODE" in
  prod)
    # Production mode
    check_port $PROD_PORT
    echo "🚀 Starting Next.js in PRODUCTION mode on port $PROD_PORT..."
    export PORT=$PROD_PORT
    export NODE_ENV=production
    NODE_OPTIONS="--max-old-space-size=4096" npm start -- -p $PROD_PORT
    ;;
  dev)
    # Development mode
    check_port $DEV_PORT
    echo "🚀 Starting Next.js in DEVELOPMENT mode on port $DEV_PORT..."
    export PORT=$DEV_PORT
    export NODE_ENV=development
    npm run dev -- -p $DEV_PORT
    ;;
  help|--help|-h)
    show_usage
    ;;
  *)
    echo "❌ Unknown mode: $MODE"
    show_usage
    exit 1
    ;;
esac

echo "🌐 Access your app at:"
echo "  http://localhost:$PROD_PORT (prod)"
echo "  http://localhost:$DEV_PORT (dev)"
