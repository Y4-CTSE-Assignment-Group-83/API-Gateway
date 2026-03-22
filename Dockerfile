# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies (production only)
RUN pnpm install --prod

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start app
CMD ["node", "index.js"]