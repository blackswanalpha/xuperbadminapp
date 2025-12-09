# 🚀 Vercel Deployment Guide

This comprehensive guide walks you through deploying the Xuperb Admin Application to Vercel.

## 📋 Prerequisites

- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/cli) installed globally
- GitHub repository with your code
- Node.js 20+ installed locally

## 🏗 Quick Start Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel@latest
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy from Project Directory

```bash
# Navigate to your project
cd xuperbadminapp

# Deploy to Vercel
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: xuperb-admin (or your preferred name)
# - Directory: ./
# - Override settings? No
```

## 🔧 Method 1: Manual Deployment via CLI

### Initial Setup

```bash
# Clone and setup project
git clone <your-repo-url>
cd xuperbadminapp
npm install

# Test local build
npm run build

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Using Deployment Scripts

```bash
# Deploy to staging
npm run vercel:deploy-preview
# or
./scripts/deploy.sh staging

# Deploy to production
npm run vercel:deploy
# or
./scripts/deploy.sh production
```

## 🔧 Method 2: GitHub Integration (Recommended)

### 1. Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm ci`

### 2. Configure Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables, add:

#### Required Variables

```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

#### Database (Choose one option)

**Option A: Vercel Postgres**
```bash
# Install Vercel Postgres addon in dashboard
# Variables are automatically added:
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
```

**Option B: External Database**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### Cache/Redis (Optional but recommended)

**Option A: Upstash Redis**
```env
REDIS_URL=redis://user:password@host:port
```

**Option B: Other Redis Provider**
```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### API Configuration

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

#### Security

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-session-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### 3. Set Up Automatic Deployments

The included GitHub Action (`.github/workflows/vercel.yml`) automatically:

- ✅ Runs tests and type checking
- 🚀 Deploys previews for pull requests
- 🎯 Deploys to production on main branch pushes
- 🏷️ Deploys staging on develop branch pushes

#### Required GitHub Secrets

Add these to your GitHub repository settings > Secrets and variables > Actions:

```env
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VERCEL_TOKEN=your-vercel-token
```

**To get these values:**

```bash
# Install Vercel CLI and login
npm install -g vercel@latest
vercel login

# Link your project
vercel link

# Get project info
vercel project ls
cat .vercel/project.json
```

## 🛠 Configuration Files Overview

### `vercel.json`
Main Vercel configuration with:
- Build settings
- Security headers
- Redirects and rewrites
- Environment variables
- Function configuration

### `next.config.ts`
Next.js configuration optimized for Vercel:
- Conditional output mode (Vercel vs Docker)
- Image optimization settings
- Security headers
- Environment variable exposure

### `.env.example`
Template for environment variables with:
- Database configuration
- API settings
- Security keys
- External service integrations

## 📊 Production Optimization

### Performance

1. **Enable Vercel Analytics**
   ```bash
   # Analytics are automatically enabled for Vercel deployments
   # View in Vercel Dashboard > Project > Analytics
   ```

2. **Edge Functions** (if needed)
   ```bash
   # Convert API routes to Edge Runtime
   export const runtime = 'edge'
   ```

3. **Image Optimization**
   ```bash
   # Already configured in next.config.ts
   # Uses Vercel's built-in image optimization
   ```

### Security

1. **Environment Variables**
   - Never commit secrets to git
   - Use Vercel Dashboard to manage production variables
   - Separate staging and production environments

2. **Domain Security**
   ```bash
   # Set up custom domain in Vercel Dashboard
   # SSL certificates are automatically managed
   ```

## 🔗 Custom Domains

### 1. Add Domain in Vercel Dashboard

1. Go to Project Settings > Domains
2. Add your domain: `yourdomain.com`
3. Configure DNS records as instructed

### 2. DNS Configuration

For apex domain (`yourdomain.com`):
```
Type: A
Name: @
Value: 76.76.19.61
```

For www subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Redirect Configuration

Already configured in `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

## 📈 Monitoring & Analytics

### Built-in Monitoring

- **Analytics**: Automatic page views and performance metrics
- **Logs**: Real-time function logs
- **Performance**: Core Web Vitals tracking
- **Errors**: Automatic error tracking

### Access Monitoring

```bash
# View logs
npm run vercel:logs
# or
vercel logs

# View deployments
vercel ls

# View domains
npm run vercel:domains
```

## 🔄 Environment Management

### Development
```bash
# Local development with Vercel environment
vercel dev

# Pull environment variables
vercel env pull .env.local
```

### Staging/Preview
```bash
# Deploy preview
vercel

# Target specific environment
vercel --target preview
```

### Production
```bash
# Deploy to production
vercel --prod

# With confirmation
npm run deploy:production
```

## 🚀 Deployment Strategies

### 1. **Branch-based Deployments**

- `main` → Production deployment
- `develop` → Staging deployment
- `feature/*` → Preview deployments
- Pull Requests → Automatic preview deployments

### 2. **Manual Deployment**

```bash
# Quick deployment
vercel

# Production with checks
npm run type-check && npm run lint && npm run build && vercel --prod
```

### 3. **Automated CI/CD**

GitHub Actions automatically handle:
- Code quality checks
- Build validation
- Preview deployments
- Production releases

## 🛡 Security Best Practices

### Environment Variables

1. **Never expose secrets in client-side code**
2. **Use `NEXT_PUBLIC_` prefix only for public variables**
3. **Rotate secrets regularly**
4. **Use different secrets for staging/production**

### Headers & Security

Already configured in `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restrictive permissions

### Database Security

1. **Use connection pooling**
2. **Enable SSL connections**
3. **Restrict database access by IP (if possible)**
4. **Regular backups**

## 🧪 Testing Deployment

### 1. **Pre-deployment Checks**

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Local build test
npm run build

# Local production test
npm start
```

### 2. **Post-deployment Verification**

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Performance test
npm run lighthouse # (if configured)
```

### 3. **Automated Testing**

The GitHub Action runs:
- TypeScript compilation
- ESLint checks
- Build verification
- Health checks

## 🔍 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build logs
vercel logs <deployment-url>

# Local build test
npm run build
```

#### Environment Variable Issues

```bash
# List environment variables
vercel env ls

# Pull latest environment
vercel env pull .env.local
```

#### Domain/SSL Issues

1. Check DNS propagation: `nslookup yourdomain.com`
2. Verify SSL certificate in browser
3. Check Vercel Dashboard for domain status

### Debug Commands

```bash
# Inspect deployment
vercel inspect <deployment-url>

# Project information
vercel project ls

# Team and project settings
vercel teams ls
vercel projects ls
```

## 📚 Additional Resources

### Vercel Documentation

- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

### Performance

- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Vercel Analytics](https://vercel.com/docs/analytics)

## 🎯 Quick Commands Reference

```bash
# Initial setup
vercel login
vercel link

# Development
vercel dev
vercel env pull

# Deployment
vercel                    # Preview
vercel --prod            # Production
vercel --target staging  # Staging

# Management
vercel logs              # View logs
vercel ls               # List deployments
vercel domains          # Manage domains
vercel env ls           # List environment variables

# Using npm scripts
npm run vercel:deploy-preview
npm run vercel:deploy
npm run deploy:production
```

## 🚀 Go Live Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Environment variables configured
- [ ] Database setup and connected
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate verified
- [ ] Health check endpoint working
- [ ] GitHub Actions secrets configured
- [ ] Analytics and monitoring enabled
- [ ] Error tracking configured
- [ ] Performance optimization verified
- [ ] Security headers tested
- [ ] Backup strategy implemented

---

Your Xuperb Admin Application is now ready for production on Vercel! 🎉

For support or questions, refer to the [Vercel Documentation](https://vercel.com/docs) or create an issue in your repository.