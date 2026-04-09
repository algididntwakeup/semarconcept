# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and lock files
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm exec vite build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (default nginx port)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
