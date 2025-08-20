#!/bin/bash

# Deployment script for production
# This script handles the deployment process

set -e

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Make sure to configure production environment variables."
fi

echo "🔧 Setting up production environment..."

# Install production dependencies only
echo "📦 Installing production dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application for production..."
npm run build

# Start the server
echo "🌐 Starting production server..."
npm run start
