#!/bin/sh
set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"

echo "⏳ Waiting for PostgreSQL at $DB_HOST:$DB_PORT ..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Postgres is unavailable - sleeping 1s..."
  sleep 1
done
echo "✅ PostgreSQL is up!"

echo "🚀 Running migrations (if any)..."
# اجرای مایگریشن؛ اگر خطا خورد، خروجی میده و متوقف میشه
npm run migration:run || {
  echo "⚠️ migration:run failed — exiting."
  exit 1
}

echo "✅ Migrations finished."
echo "🚀 Starting NestJS..."
exec npm run start:prod