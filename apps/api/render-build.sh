#!/bin/bash
# Build script for Render — installs Chrome for Puppeteer PDF generation

set -e

cd ../..

# Install npm dependencies
npm install

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome

# Sync database schema
npx prisma db push --schema=packages/persistence/src/prisma/schema.prisma
