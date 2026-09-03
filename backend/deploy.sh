#!/bin/bash

# SolveHub Backend Deployment Script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes detected. Committing..."
    git add .
    echo "Enter commit message (or press Enter for default):"
    read commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Deploy backend to production"
    fi
    git commit -m "$commit_message"
else
    echo "✅ No uncommitted changes"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel Dashboard"
    echo "2. Update OAuth redirect URIs"
    echo "3. Update FRONTEND_URL with your Vercel frontend URL"
    echo "4. Test your deployment at the provided URL"
    echo ""
    echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Deployment failed"
    exit 1
fi
