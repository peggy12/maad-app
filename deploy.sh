#!/bin/bash
# Quick deployment script for MAAD app

echo "🚀 MAAD App - Quick Deploy Script"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial MAAD app commit with Base44 integration"
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi

# Build the app
echo ""
echo "🔨 Building production app..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Show deployment options
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "Option 1: Deploy to Vercel (Recommended)"
echo "  1. Install: npm install -g vercel"
echo "  2. Deploy: vercel"
echo "  3. Follow prompts and set environment variables"
echo ""
echo "Option 2: Deploy to Netlify"
echo "  1. Install: npm install -g netlify-cli"
echo "  2. Deploy: netlify deploy --prod --dir=dist"
echo ""
echo "Option 3: Manual Upload"
echo "  Upload the 'dist' folder to any web host"
echo ""
echo "🔐 Don't forget to set these environment variables on your platform:"
echo "  - VITE_FACEBOOK_PAGE_ID=820172544505737"
echo "  - VITE_FACEBOOK_ACCESS_TOKEN=<your_token>"
echo "  - VITE_BASE44_BASE_URL=https://manaboutadog.base44.app"
echo "  - VITE_BASE44_AGENT_NAME=MAAD"
echo "  - VITE_BASE44_API_KEY=d4c9f08499e944ef99621b19d45e9df3"
echo ""
echo "📖 Full guide: See DEPLOYMENT.md"
