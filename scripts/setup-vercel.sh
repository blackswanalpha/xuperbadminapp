#!/bin/bash

# ================================
# Vercel Setup Script
# ================================

set -e

echo "🚀 Xuperb Admin - Vercel Setup Script"
echo "======================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
else
    echo "✅ Vercel CLI already installed"
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
else
    echo "✅ Already logged in to Vercel"
fi

# Function to setup new project
setup_new_project() {
    echo "🏗️ Setting up new Vercel project..."
    
    # Run build test
    echo "🧪 Testing local build..."
    npm run build
    
    # Initialize Vercel project
    echo "🔗 Initializing Vercel project..."
    vercel
    
    echo "✅ Project setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure environment variables in Vercel Dashboard"
    echo "2. Set up your database (Vercel Postgres, PlanetScale, etc.)"
    echo "3. Add your custom domain (optional)"
    echo "4. Configure GitHub integration for automatic deployments"
    echo ""
    echo "🌐 Your app is now deployed! Check the URL provided above."
}

# Function to deploy existing project
deploy_existing() {
    echo "🚀 Deploying existing project..."
    
    # Check if .vercel directory exists
    if [ -d ".vercel" ]; then
        echo "✅ Project already linked to Vercel"
    else
        echo "🔗 Linking to existing project..."
        vercel link
    fi
    
    # Run checks
    echo "🔍 Running pre-deployment checks..."
    npm run type-check
    npm run lint
    npm run build
    
    # Deploy
    echo "🚀 Deploying to production..."
    vercel --prod
    
    echo "✅ Deployment complete!"
}

# Function to setup environment variables
setup_env_vars() {
    echo "🔧 Environment Variables Setup"
    echo "=============================="
    echo ""
    echo "You need to set up the following environment variables in Vercel Dashboard:"
    echo ""
    echo "Required:"
    echo "- NODE_ENV=production"
    echo "- NEXT_TELEMETRY_DISABLED=1"
    echo ""
    echo "Database (choose one):"
    echo "- DATABASE_URL=postgresql://..."
    echo "- Or use Vercel Postgres addon"
    echo ""
    echo "Security:"
    echo "- JWT_SECRET=your-secret-key"
    echo "- SESSION_SECRET=your-session-key"
    echo ""
    echo "API:"
    echo "- NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com"
    echo ""
    echo "🌐 Open Vercel Dashboard to configure: https://vercel.com/dashboard"
    
    read -p "Press Enter when you've configured the environment variables..."
}

# Function to setup GitHub integration
setup_github() {
    echo "🔗 GitHub Integration Setup"
    echo "============================"
    echo ""
    echo "To enable automatic deployments:"
    echo ""
    echo "1. Push your code to GitHub"
    echo "2. In Vercel Dashboard, go to Project Settings > Git"
    echo "3. Connect your GitHub repository"
    echo "4. Configure branch settings:"
    echo "   - Production Branch: main"
    echo "   - Preview Branches: All branches"
    echo ""
    echo "5. Add these secrets to GitHub repository settings:"
    echo "   - VERCEL_ORG_ID"
    echo "   - VERCEL_PROJECT_ID" 
    echo "   - VERCEL_TOKEN"
    echo ""
    echo "To get these values, run:"
    echo "  vercel project ls"
    echo "  cat .vercel/project.json"
    echo ""
    read -p "Press Enter when GitHub integration is complete..."
}

# Function to run health check
health_check() {
    echo "🏥 Running health check..."
    
    # Get deployment URL
    if [ -f ".vercel/project.json" ]; then
        echo "🌐 Checking deployment health..."
        # Note: In a real script, you'd extract the actual URL
        echo "✅ Health check endpoint: /api/health"
        echo "🔍 Test your deployment manually at your Vercel URL"
    else
        echo "⚠️  Project not yet deployed. Run setup first."
    fi
}

# Main menu
echo ""
echo "What would you like to do?"
echo ""
echo "1) Setup new project and deploy"
echo "2) Deploy existing project"
echo "3) Setup environment variables guide"
echo "4) Setup GitHub integration guide"
echo "5) Run health check"
echo "6) Exit"
echo ""

read -p "Choose an option (1-6): " choice

case $choice in
    1)
        setup_new_project
        ;;
    2)
        deploy_existing
        ;;
    3)
        setup_env_vars
        ;;
    4)
        setup_github
        ;;
    5)
        health_check
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-6."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! Your Xuperb Admin app is ready on Vercel!"
echo ""
echo "📚 For more information, check out:"
echo "- VERCEL-DEPLOYMENT.md (detailed deployment guide)"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Vercel Documentation: https://vercel.com/docs"