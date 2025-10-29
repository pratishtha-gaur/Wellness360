# Wellness360 Backend Deployment Guide

This guide covers various deployment options for the Wellness360 backend API.

## Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)
- Google Gemini API key
- Domain name (for production)
- SSL certificate (for production)

## Environment Setup

### 1. Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/wellness360
MONGODB_TEST_URI=mongodb://localhost:27017/wellness360_test

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Google Gemini API Configuration
GOOGLE_API_KEY=your-google-gemini-api-key-here

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Admin Configuration
ADMIN_EMAILS=admin@yourdomain.com,superadmin@yourdomain.com

# AI Service Configuration
AI_TEMPERATURE=0.7
AI_MAX_OUTPUT_TOKENS=2048

# XP System Configuration
XP_PER_LEVEL=100
MAX_LEVEL=100
```

### 2. Security Considerations

- Use strong, unique JWT secrets
- Enable MongoDB authentication
- Use environment-specific database names
- Configure proper CORS origins
- Set up rate limiting appropriately
- Use HTTPS in production

## Deployment Options

### Option 1: Traditional VPS/Server Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd wellness360/backend

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start dist/server.js --name wellness360-api
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/wellness360-api`:

```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/wellness360-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-api-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S wellness360 -u 1001

# Change ownership
RUN chown -R wellness360:nodejs /app
USER wellness360

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/wellness360
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - FRONTEND_URL=${FRONTEND_URL}
    depends_on:
      - mongo
    restart: unless-stopped
    networks:
      - wellness360-network

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped
    networks:
      - wellness360-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - wellness360-network

volumes:
  mongo_data:

networks:
  wellness360-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployment

#### AWS Deployment

1. **EC2 Instance Setup**
   - Launch EC2 instance (t3.medium or larger)
   - Configure security groups for ports 22, 80, 443, 5000
   - Install Docker and Docker Compose

2. **RDS MongoDB Setup**
   - Create MongoDB cluster on AWS DocumentDB
   - Configure security groups
   - Update MONGODB_URI

3. **Application Deployment**
   ```bash
   # Clone and deploy
   git clone <your-repo-url>
   cd wellness360/backend
   docker-compose up -d
   ```

#### Google Cloud Platform

1. **App Engine Deployment**
   ```yaml
   # app.yaml
   runtime: nodejs18
   env: standard
   
   env_variables:
     NODE_ENV: production
     MONGODB_URI: mongodb://your-mongo-uri
     JWT_SECRET: your-jwt-secret
     GOOGLE_API_KEY: your-gemini-key
   ```

   Deploy:
   ```bash
   gcloud app deploy
   ```

2. **Cloud Run Deployment**
   ```bash
   # Build and push to Container Registry
   gcloud builds submit --tag gcr.io/PROJECT-ID/wellness360-api
   
   # Deploy to Cloud Run
   gcloud run deploy wellness360-api \
     --image gcr.io/PROJECT-ID/wellness360-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

#### Heroku Deployment

1. **Create Heroku App**
   ```bash
   heroku create wellness360-api
   ```

2. **Configure Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb://your-mongo-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set GOOGLE_API_KEY=your-gemini-key
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

## Monitoring and Maintenance

### 1. Health Monitoring

Set up monitoring for:
- API response times
- Error rates
- Database connection status
- Memory usage
- CPU usage

### 2. Log Management

```bash
# View PM2 logs
pm2 logs wellness360-api

# View Docker logs
docker-compose logs -f api

# Set up log rotation
pm2 install pm2-logrotate
```

### 3. Backup Strategy

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/wellness360" --out=/backup/wellness360-$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb://localhost:27017/wellness360" --out=/backup/wellness360-$DATE
find /backup -name "wellness360-*" -mtime +7 -delete
```

### 4. Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit
npm update

# Update Docker images
docker-compose pull
docker-compose up -d
```

## Performance Optimization

### 1. Database Optimization

- Enable MongoDB indexing
- Use connection pooling
- Implement query optimization
- Set up database monitoring

### 2. Application Optimization

- Enable gzip compression
- Implement caching strategies
- Optimize API responses
- Use CDN for static assets

### 3. Load Balancing

For high-traffic applications:

```nginx
upstream wellness360_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    location / {
        proxy_pass http://wellness360_backend;
    }
}
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB Connection Issues**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **PM2 Process Issues**
   ```bash
   pm2 restart wellness360-api
   pm2 logs wellness360-api --lines 100
   ```

4. **Docker Issues**
   ```bash
   docker-compose logs api
   docker-compose restart api
   ```

### Debug Mode

Enable debug logging:
```bash
export DEBUG=wellness360:*
npm run dev
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancers
- Implement database sharding
- Use Redis for session storage
- Implement microservices architecture

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching layers
- Use CDN for static content

This deployment guide provides comprehensive instructions for deploying the Wellness360 backend API across various platforms and environments.
