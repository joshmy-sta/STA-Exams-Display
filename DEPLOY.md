# STA Exams Display - Deployment Guide

This document contains all the build steps and deployment processes for the STA Exams Display application.

## Overview

This is a React + Vite application containerized with Docker, served using Nginx.

## Prerequisites

- Docker installed on your server
- Docker Compose installed on your server
- Access to port 3000 (or your chosen port)

## Initial Deployment

### Build and Start the Application

```bash
# Navigate to the project directory
cd /var/www/moodle/STA-Exams-Display

# Build and start the container
sudo docker-compose up -d --build
```

The application will be available at:
- Local: http://localhost:3000
- Server: http://YOUR_SERVER_IP:3000

## Making Code Changes

Whenever you make changes to the code, you must rebuild the Docker container:

```bash
# Rebuild and restart with new code
sudo docker-compose up -d --build
```

This process:
1. Rebuilds the Docker image with your updated code
2. Stops the old container
3. Starts a new container with the changes

## Container Management

### View Running Containers

```bash
sudo docker ps
```

### View Application Logs

```bash
# Follow logs in real-time
sudo docker-compose logs -f

# View last 100 lines
sudo docker-compose logs --tail=100
```

### Stop the Application

```bash
sudo docker-compose down
```

### Restart the Application

```bash
sudo docker-compose restart
```

### Stop and Remove Everything

```bash
# Stop and remove containers, networks
sudo docker-compose down

# Also remove volumes (if any)
sudo docker-compose down -v
```

## Direct Docker Commands

If you prefer using Docker directly instead of Docker Compose:

```bash
# Build the image
sudo docker build -t sta-exams-display .

# Run the container
sudo docker run -d -p 3000:80 --name sta-exams-display sta-exams-display

# Stop the container
sudo docker stop sta-exams-display

# Remove the container
sudo docker rm sta-exams-display

# View logs
sudo docker logs -f sta-exams-display
```

## Configuration

### Change the Port

Edit `docker-compose.yml` and modify the ports line:

```yaml
ports:
  - "8080:80"  # Change 8080 to your desired port
```

Then rebuild:

```bash
sudo docker-compose up -d --build
```

### Update Nginx Configuration

Edit `nginx.conf` to modify server settings, caching, or security headers, then rebuild.

## Docker Files

- **Dockerfile** - Multi-stage build configuration (Node.js + Nginx)
- **docker-compose.yml** - Orchestration configuration
- **nginx.conf** - Web server configuration
- **.dockerignore** - Files excluded from Docker build

## Build Process Explained

The Dockerfile uses a multi-stage build:

1. **Stage 1 (Builder):**
   - Uses Node.js 18 Alpine image
   - Installs npm dependencies
   - Builds the React/Vite application
   - Creates optimized static files in `/dist`

2. **Stage 2 (Production):**
   - Uses Nginx Alpine image (lightweight)
   - Copies built files from Stage 1
   - Configures Nginx
   - Exposes port 80 internally (mapped to 3000 externally)

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
sudo docker-compose logs

# Check if port is already in use
sudo netstat -tulpn | grep 3000
```

### Can't access the application

1. Verify the container is running: `sudo docker ps`
2. Check firewall rules allow port 3000
3. Check logs: `sudo docker-compose logs -f`

### Build fails

```bash
# Clean up and rebuild
sudo docker-compose down
sudo docker system prune -f
sudo docker-compose up -d --build
```

### Out of disk space

```bash
# Remove unused Docker images and containers
sudo docker system prune -a
```

## Production Checklist

- [ ] Application builds successfully
- [ ] Container starts without errors
- [ ] Application accessible via browser
- [ ] Logs show no errors
- [ ] Static assets loading correctly
- [ ] Port configured correctly in firewall

## Quick Reference

```bash
# Deploy/Update
sudo docker-compose up -d --build

# View logs
sudo docker-compose logs -f

# Restart
sudo docker-compose restart

# Stop
sudo docker-compose down

# Check status
sudo docker ps
```

## Support

For issues with the application, check the logs first:
```bash
sudo docker-compose logs -f
```

For Docker-specific issues, refer to Docker documentation or check Docker daemon status:
```bash
sudo systemctl status docker
```
