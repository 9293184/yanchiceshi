#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy || true

echo "Starting server..."
exec npx tsx src/index.ts
