# Build stage
FROM golang:1.21-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o main .

# Run stage
FROM alpine:latest

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# We don't copy .env file as environment variables will be provided by docker-compose
# COPY --from=builder /app/.env .

# Install CA certificates for HTTPS and set timezone
RUN apk --no-cache add ca-certificates tzdata && \
    chmod +x /app/main

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Use non-root user
USER appuser

# Expose port
EXPOSE 8080

# Start the application
CMD ["./main"] 