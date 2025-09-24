FROM node:20 AS builder
WORKDIR /app

# کپی فایل‌های package.json برای نصب پکیج‌ها
COPY package*.json ./
RUN npm install

# کپی سورس پروژه و build
COPY . .
RUN npm run build

# مرحله production
FROM node:20 AS production
WORKDIR /app

# فقط dependencyهای ضروری
COPY package*.json ./
RUN npm install --only=production

# فقط خروجی build شده رو بیار
COPY --from=builder /app/dist ./dist

# اگر فایل‌های config (مثل .env) نیاز داری هم کپی کن
COPY --from=builder /app/.env ./.env

EXPOSE 5000
CMD ["node", "dist/src/main.js"]


