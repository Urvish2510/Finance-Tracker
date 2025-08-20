#!/bin/bash

# Build script for different environments
# Usage: ./scripts/build.sh [development|production|test]

set -e

ENV=${1:-production}

echo "🔨 Building Finance Tracker for $ENV environment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run environment-specific build
case $ENV in
  "development")
    echo "🛠️ Building for development..."
    npm run build:dev
    ;;
  "test")
    echo "🧪 Building for testing..."
    npm run build:test
    ;;
  "production")
    echo "🚀 Building for production..."
    npm run build
    ;;
  *)
    echo "❌ Unknown environment: $ENV"
    echo "Usage: ./scripts/build.sh [development|production|test]"
    exit 1
    ;;
esac

echo "✅ Build completed for $ENV environment"

# Show build output info
if [ -d "dist" ]; then
    echo "📊 Build output:"
    ls -la dist/
    echo "📁 Build size:"
    du -sh dist/
fi

echo "🎉 Ready to deploy!"
