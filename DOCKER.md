# 🐳 Docker Setup Guide

This guide provides comprehensive instructions for running the Xuperb Admin Application using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- 10GB of free disk space

## 🚀 Quick Start

### Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd xuperbadminapp

# Start the development environment
npm run docker:compose-dev

# Or manually
docker-compose up --build
```

### Production Environment

```bash
# Build and start production environment
npm run docker:compose-prod

# Or manually
docker-compose -f docker-compose.prod.yml up --build
```

## 📁 Docker Files Overview

### Dockerfiles
- `Dockerfile` - Optimized production build (multi-stage)
- `Dockerfile.dev` - Development environment with hot reload
- `.dockerignore` - Files excluded from Docker context

### Docker Compose Files
- `docker-compose.yml` - Development setup with all services
- `docker-compose.prod.yml` - Production setup with optimizations

### Configuration
- `docker/nginx/nginx.conf` - Development Nginx configuration
- `docker/nginx/nginx.prod.conf` - Production Nginx configuration
- `docker/postgres/init.sql` - Database initialization script

## 🛠 Available Services

| Service | Development Port | Production Port | Description |
|---------|-----------------|-----------------|-------------|
| Web App | 3000 | 3000 | Next.js application |
| PostgreSQL | 5432 | - | Database server |
| Redis | 6379 | - | Cache server |
| PgAdmin | 8080 | - | Database management |
| Nginx | 80, 443 | 80, 443 | Reverse proxy |

## 🔧 NPM Scripts

```bash
# Docker Build Commands
npm run docker:build          # Build production image
npm run docker:build-dev      # Build development image

# Docker Run Commands
npm run docker:run            # Run production container
npm run docker:run-dev        # Run development container

# Docker Compose Commands
npm run docker:compose        # Start development environment
npm run docker:compose-dev    # Start with build
npm run docker:compose-prod   # Start production environment
npm run docker:compose-down   # Stop all services
npm run docker:compose-down-v # Stop and remove volumes

# Utility Commands
npm run docker:logs           # View logs
npm run docker:clean          # Clean Docker system
npm run docker:rebuild        # Rebuild everything
```

## 🔍 Usage Examples

### Development with Hot Reload

```bash
# Start development environment
docker-compose up

# View specific service logs
docker-compose logs -f web

# Execute commands in running container
docker-compose exec web npm run lint
docker-compose exec postgres psql -U xuperb_user -d xuperb_admin
```

### Production Deployment

```bash
# Set environment variables (optional)
export POSTGRES_PASSWORD=your_secure_password
export REDIS_PASSWORD=your_redis_password

# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale the application (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale web=3
```

### Database Management

```bash
# Access PgAdmin (development only)
# Navigate to http://localhost:8080
# Email: admin@xuperb.com
# Password: pgadmin_secure_password_2024

# Direct database access
docker-compose exec postgres psql -U xuperb_user -d xuperb_admin

# Backup database
docker-compose exec postgres pg_dump -U xuperb_user xuperb_admin > backup.sql

# Restore database
docker-compose exec -T postgres psql -U xuperb_user xuperb_admin < backup.sql
```

## 🔒 Security Features

### Production Security
- Non-root user execution
- Security headers via Nginx
- Rate limiting
- SSL/HTTPS support
- Content Security Policy
- HSTS headers

### Development Security
- Isolated network
- Secure default passwords
- Volume mounting restrictions

## 🏗 Build Optimization

The production Dockerfile uses multi-stage builds for optimization:

1. **Dependencies Stage** - Install only production dependencies
2. **Builder Stage** - Build the application with all dependencies
3. **Runner Stage** - Minimal runtime with only necessary files

### Build Features
- Alpine Linux base (smaller image size)
- Layer caching optimization
- Standalone Next.js output
- Non-root user execution
- Health checks

## 🔧 Environment Variables

### Database Configuration
```env
POSTGRES_DB=xuperb_admin
POSTGRES_USER=xuperb_user
POSTGRES_PASSWORD=xuperb_secure_password_2024
```

### Redis Configuration
```env
REDIS_PASSWORD=xuperb_redis_2024
```

### Application Configuration
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- Application: `http://localhost:3000/api/health`
- Nginx: `http://localhost:80/health`

### Docker Health Checks
```bash
# Check container health
docker ps
docker inspect <container_id> | grep Health -A 10

# View health check logs
docker logs <container_id>
```

## 🛠 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify database connectivity
docker-compose exec web npm run db:test
```

#### Build Failures
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Volume Permission Issues
```bash
# Fix volume permissions
docker-compose exec web chown -R nextjs:nodejs /app
```

### Performance Tuning

#### Development Performance
```bash
# Enable file watching polling (if needed)
export WATCHPACK_POLLING=true
docker-compose up
```

#### Production Performance
- Use production compose file
- Enable Nginx caching
- Use Redis for session storage
- Scale horizontally if needed

## 🔄 Updates & Maintenance

### Updating Dependencies
```bash
# Update base images
docker-compose pull

# Rebuild with new dependencies
npm run docker:rebuild
```

### Backup Strategy
```bash
# Create backup script
#!/bin/bash
docker-compose exec postgres pg_dump -U xuperb_user xuperb_admin > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Log Rotation
```bash
# Configure log rotation in production
docker-compose -f docker-compose.prod.yml up -d --log-opt max-size=10m --log-opt max-file=3
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🤝 Contributing

When contributing Docker-related changes:

1. Test both development and production environments
2. Update this documentation
3. Verify security configurations
4. Test on multiple platforms (Linux, macOS, Windows)
5. Check performance impact

---

For support, please create an issue in the repository or contact the development team.