#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./packages/persistence/src/prisma/schema.prisma

echo "Starting API server..."
node apps/api/dist/server.js
