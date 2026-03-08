#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec npx tsx src/index.ts
