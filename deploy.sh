#!/bin/bash

# VintuSure Firebase Deployment Script
echo "🚀 Starting VintuSure deployment to Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Navigate to web app directory
cd apps/web

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test -- --run

# Build for production
echo "🔨 Building for production..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. dist directory not found."
    exit 1
fi

# Go back to root directory
cd ../..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://vintusure.web.app"
