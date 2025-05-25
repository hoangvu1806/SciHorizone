# Stage 1: Build
FROM node:lts-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:lts-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4040

# Copy only necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Install only production dependencies
RUN npm ci --only=production

# No additional setup needed

# Expose the production port
EXPOSE 4040

# Start the application in production mode
CMD ["npm", "start"]