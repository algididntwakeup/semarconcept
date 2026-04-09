# Stage 1: Build the Go application
FROM golang:1.24 AS builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy all source code
COPY . .

# Download dependencies and build
RUN go mod download && \
    CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o reksolindo-backend ./main.go

# Stage 2: Create the final, minimal image
FROM alpine:latest

# Add ca-certificates for HTTPS calls
RUN apk --no-cache add ca-certificates

# Set the Current Working Directory inside the container
WORKDIR /root/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/reksolindo-backend .

# Copy the config file
# Ensure your config.yaml is in the same directory as your Dockerfile or adjust path
COPY config.yaml . 

# Expose port 4072 to the outside world
EXPOSE 4072

# Command to run the executable
# The application will look for config.yaml in the current working directory (/root/)
CMD ["./reksolindo-backend"]