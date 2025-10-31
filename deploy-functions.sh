#!/bin/bash

echo "🚀 Deploying Firebase Functions for Custom Claims..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "📝 Checking Firebase login status..."
firebase login:list

# Install functions dependencies
echo "📦 Installing function dependencies..."
cd functions
npm install
cd ..

# Deploy functions
echo "🚀 Deploying functions to Firebase..."
firebase deploy --only functions

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set custom claims for existing users"
echo "2. Hard refresh browser (Ctrl + Shift + R)"
echo "3. Login and test"
echo ""






