@echo off
REM Windows build script for different environments
REM Usage: scripts\build.bat [development|production|test]

set ENV=%1
if "%ENV%"=="" set ENV=production

echo 🔨 Building Finance Tracker for %ENV% environment...

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci

REM Run environment-specific build
if "%ENV%"=="development" (
    echo 🛠️ Building for development...
    call npm run build:dev
) else if "%ENV%"=="test" (
    echo 🧪 Building for testing...
    call npm run build:test
) else if "%ENV%"=="production" (
    echo 🚀 Building for production...
    call npm run build
) else (
    echo ❌ Unknown environment: %ENV%
    echo Usage: scripts\build.bat [development^|production^|test]
    exit /b 1
)

echo ✅ Build completed for %ENV% environment

REM Show build output info
if exist "dist" (
    echo 📊 Build output:
    dir dist
    echo 📁 Build created successfully
)

echo 🎉 Ready to deploy!
