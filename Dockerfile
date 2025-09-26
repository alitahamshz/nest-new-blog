# ---- Builder Stage ----
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20 AS production
WORKDIR /app

# نصب netcat برای تست دسترسی
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
# Copy the entrypoint script into the production image
COPY entrypoint.sh .
# Make the script executable
RUN chmod +x entrypoint.sh

# Copy your .env file
COPY --from=builder /app/.env ./.env

EXPOSE 5000

# Set the entrypoint to be your script.
# This will now run before the main application starts.
ENTRYPOINT ["./entrypoint.sh"]

