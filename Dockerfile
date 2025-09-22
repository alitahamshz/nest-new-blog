FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install       # نصب همه پکیج‌ها (dev + prod)

COPY . .

RUN npm run build     # اجرا build با nest cli

# حذف devDependencies بعد از build (اختیاری)
RUN npm prune --production

CMD ["node", "dist/main"]
EXPOSE 5000

