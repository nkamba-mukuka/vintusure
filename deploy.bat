@echo off
REM VintuSure Firebase Deployment Script for Windows
echo 🚀 Starting VintuSure deployment to Firebase...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo firebase login
    pause
    exit /b 1
)

REM Navigate to web app directory
cd apps\web

REM Install dependencies if needed
echo 📦 Installing dependencies...
call npm install

REM Run tests
echo 🧪 Running tests...
call npm test -- --run

REM Build for production
echo 🔨 Building for production...
call npm run build:prod

REM Check if build was successful
if not exist "dist" (
    echo ❌ Build failed. dist directory not found.
    pause
    exit /b 1
)

REM Go back to root directory
cd ..\..

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
firebase deploy

echo ✅ Deployment completed!
echo 🌐 Your app should be available at: https://vintusure.web.app
pause
