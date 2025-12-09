#!/bin/bash

# ================================
# Vercel Deployment Script
# ================================

set -e

echo "🚀 Starting Vercel deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Function to deploy to staging
deploy_staging() {
    echo "🎯 Deploying to staging environment..."
    vercel --confirm
    echo "✅ Staging deployment complete!"
}

# Function to deploy to production
deploy_production() {
    echo "🎯 Deploying to production environment..."
    
    # Run type checking
    echo "🔍 Running type checks..."
    npm run type-check
    
    # Run linting
    echo "📝 Running linting..."
    npm run lint
    
    # Build the project
    echo "🏗️ Building the project..."
    npm run build
    
    # Deploy to production
    echo "🚀 Deploying to production..."
    vercel --prod --confirm
    
    echo "✅ Production deployment complete!"
}

# Function to show deployment status
show_status() {
    echo "📊 Deployment Status:"
    vercel ls
}

# Function to show logs
show_logs() {
    echo "📋 Recent deployment logs:"
    vercel logs
}

# Function to manage environment variables
manage_env() {
    echo "🔧 Environment Variables:"
    vercel env ls
}

# Function to show domains
show_domains() {
    echo "🌐 Configured Domains:"
    vercel domains
}

# Main menu
case "$1" in
    "staging"|"preview")
        deploy_staging
        ;;
    "production"|"prod")
        deploy_production
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "env")
        manage_env
        ;;
    "domains")
        show_domains
        ;;
    "help"|"--help"|"-h")
        echo "Usage: $0 {staging|production|status|logs|env|domains|help}"
        echo ""
        echo "Commands:"
        echo "  staging     Deploy to staging environment"
        echo "  production  Deploy to production environment"
        echo "  status      Show deployment status"
        echo "  logs        Show recent logs"
        echo "  env         Manage environment variables"
        echo "  domains     Show configured domains"
        echo "  help        Show this help message"
        ;;
    *)
        echo "❌ Invalid command. Use '$0 help' for usage information."
        exit 1
        ;;
esac