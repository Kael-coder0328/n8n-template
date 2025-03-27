# Use Node.js LTS version
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with cache optimization
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
ARG NEXT_PUBLIC_GITHUB_REDIRECT_URI
ARG NEXT_PUBLIC_LEMONSQUEEZY_API_KEY
ARG NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID
ARG NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
ARG NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_1
ARG NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_2
ARG NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_3

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_REDIRECT_URI
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID
ENV NEXT_PUBLIC_GITHUB_REDIRECT_URI=$NEXT_PUBLIC_GITHUB_REDIRECT_URI
ENV NEXT_PUBLIC_LEMONSQUEEZY_API_KEY=$NEXT_PUBLIC_LEMONSQUEEZY_API_KEY
ENV NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID=$NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID
ENV NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID=$NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
ENV NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_1=$NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_1
ENV NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_2=$NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_2
ENV NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_3=$NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID_3

# Build application with output standalone option
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"] 