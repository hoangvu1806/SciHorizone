#!/bin/sh

# run.sh - Script để chạy ứng dụng Next.js trong môi trường production hoặc development

# Mặc định là chế độ production nếu không có tham số
MODE=${1:-prod}

# Kiểm tra xem port đã được sử dụng chưa
check_port() {
  PORT_TO_CHECK=$1
  if command -v lsof >/dev/null 2>&1; then
    if lsof -i :$PORT_TO_CHECK | grep LISTEN >/dev/null 2>&1; then
      echo "[ERROR] Port $PORT_TO_CHECK is already in use. Please stop the conflicting process or use another port." >&2
      exit 1
    fi
  elif command -v netstat >/dev/null 2>&1; then
    if netstat -tuln | grep :$PORT_TO_CHECK >/dev/null 2>&1; then
      echo "[ERROR] Port $PORT_TO_CHECK is already in use. Please stop the conflicting process or use another port." >&2
      exit 1
    fi
  fi
}

# Xử lý tín hiệu để tắt ứng dụng một cách an toàn
handle_sigterm() {
  echo "[INFO] Received SIGTERM, shutting down gracefully..."
  exit 0
}

# Đăng ký bộ xử lý tín hiệu
trap handle_sigterm SIGTERM SIGINT

# Chạy ứng dụng dựa trên chế độ
if [ "$MODE" = "dev" ]; then
  # Chế độ development
  check_port 4041
  echo "[INFO] Starting Next.js in DEVELOPMENT mode on port 4041..."
  export PORT=4041
  export NODE_ENV=development
  npm run dev -- -p 4041
else
  # Chế độ production
  check_port 4040
  echo "[INFO] Starting Next.js in PRODUCTION mode on port 4040..."
  export NODE_ENV=production
  export PORT=4040
  
  # Trong môi trường production, không cần build lại vì đã được build trong Dockerfile
  echo "[INFO] Using pre-built application..."
  
  # Khởi động ứng dụng với các tùy chọn tối ưu hóa
  NODE_OPTIONS="--max-old-space-size=4096" npm start -- -p 4040
fi

echo "[INFO] Access your app at:"
echo "  http://localhost:4040 (prod)"
echo "  http://localhost:4041 (dev)"