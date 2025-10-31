@echo off
echo 🚀 Deploying Firebase Functions for Custom Claims...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if logged in
echo 📝 Checking Firebase login status...
firebase login:list

REM Install functions dependencies
echo 📦 Installing function dependencies...
cd functions
call npm install
cd ..

REM Deploy functions
echo 🚀 Deploying functions to Firebase...
firebase deploy --only functions

echo.
echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Set custom claims for existing users
echo 2. Hard refresh browser (Ctrl + Shift + R)
echo 3. Login and test
echo.
pause






