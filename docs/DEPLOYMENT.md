# SkillVerse Production Deployment Guide

## Overview

This guide covers deploying SkillVerse to production environments. The application consists of:
- **Frontend**: React/Vite application
- **Backend**: Node.js/Express API server
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Authentication**: Clerk
- **Payments**: Stripe

---

## Deployment Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)
**Recommended for**: Quick deployment, automatic scaling

### Option 2: Docker + Cloud Provider
**Recommended for**: Full control, Kubernetes ready

### Option 3: Traditional VPS (DigitalOcean, AWS EC2)
**Recommended for**: Cost control, custom configurations

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all production environment variables are set:

#### Backend (.env.production)
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI_PROD=mongodb+srv://user:password@cluster.mongodb.net/skillverse

# JWT
JWT_SECRET=your-super-secure-secret-key-min-32-chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail/SendGrid)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=SkillVerse <noreply@skillverse.com>

# Frontend URL
FRONTEND_URL=https://skillverse.com
CLIENT_URL=https://skillverse.com

# Video (Agora)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate

# AI (OpenAI)
OPENAI_API_KEY=sk-xxxxx
AI_MODEL=gpt-3.5-turbo

# CORS
CORS_ORIGIN=https://skillverse.com
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://api.skillverse.com/api/v1
VITE_SOCKET_URL=https://api.skillverse.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
VITE_AGORA_APP_ID=your-agora-app-id
```

### 2. Security Checklist

- [ ] All secrets are unique and secure (use password generator)
- [ ] JWT secrets are at least 32 characters
- [ ] HTTPS is enabled everywhere
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are enabled
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] Stripe webhooks are verified
- [ ] Clerk production instance is set up

### 3. Database Setup

1. Create MongoDB Atlas production cluster
2. Create database user with limited permissions
3. Configure IP whitelist (or allow all: 0.0.0.0/0)
4. Get connection string and update MONGODB_URI_PROD

---

## Deployment Instructions

### Option 1: Vercel + Railway

#### Frontend (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all VITE_ prefixed variables

4. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

#### Backend (Railway)

1. **Create Railway Account** at https://railway.app

2. **Deploy via GitHub**
   - Connect your GitHub repository
   - Select the `backend` folder as root
   - Railway auto-detects Node.js

3. **Add Environment Variables**
   - Go to Variables tab
   - Add all backend environment variables

4. **Configure Start Command**
   ```
   node server.js
   ```

5. **Get Public URL**
   - Railway provides a public URL
   - Update frontend VITE_API_URL with this URL

---

### Option 2: Docker Deployment

#### Build Docker Images

**Backend Dockerfile** (already created at `backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Frontend Dockerfile** (create at `frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always
```

#### Deploy to Cloud

**AWS ECS / Google Cloud Run / Azure Container Apps:**
1. Push images to container registry
2. Create service with environment variables
3. Configure load balancer and SSL

---

### Option 3: Traditional VPS

#### Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Deploy Backend

```bash
# Clone repository
git clone https://github.com/M-Shameel-375/skill_verse.git
cd skill_verse/backend

# Install dependencies
npm ci --only=production

# Create environment file
nano .env.production

# Start with PM2
pm2 start server.js --name skillverse-api
pm2 save
pm2 startup
```

#### Deploy Frontend

```bash
cd ../frontend

# Install and build
npm ci
npm run build

# Copy to nginx
sudo cp -r dist/* /var/www/skillverse/
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/skillverse

# Frontend
server {
    listen 80;
    server_name skillverse.com www.skillverse.com;
    
    root /var/www/skillverse;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API subdomain (optional)
server {
    listen 80;
    server_name api.skillverse.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Enable Site and SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/skillverse /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d skillverse.com -d www.skillverse.com -d api.skillverse.com
```

---

## Post-Deployment

### 1. Configure Clerk Production

1. Go to Clerk Dashboard
2. Switch to Production mode
3. Update redirect URLs to production domain
4. Enable social providers with production credentials

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.skillverse.com/api/v1/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, etc.
4. Get webhook secret and update environment variable

### 3. Monitor and Scale

- Set up monitoring (PM2 Dashboard, New Relic, Datadog)
- Configure error tracking (Sentry)
- Set up log aggregation (LogDNA, Papertrail)
- Configure auto-scaling (if using cloud)

### 4. Backup Strategy

- MongoDB Atlas automatic backups (enable)
- Cloudinary media backup
- Regular database exports

---

## Troubleshooting

### Common Issues

**CORS Errors**
- Verify CORS_ORIGIN and FRONTEND_URL match exactly
- Check for trailing slashes

**WebSocket Connection Failed**
- Ensure proxy configuration includes /socket.io
- Check firewall rules

**Authentication Issues**
- Verify Clerk keys are for correct environment
- Check redirect URLs in Clerk dashboard

**Database Connection**
- Verify IP whitelist in MongoDB Atlas
- Check connection string format

**Payment Webhook Failures**
- Verify webhook secret
- Check webhook endpoint is accessible
- Review Stripe webhook logs

---

## Support

For issues, check:
1. Application logs: `pm2 logs skillverse-api`
2. Nginx logs: `/var/log/nginx/error.log`
3. MongoDB Atlas logs
4. Stripe Dashboard → Developers → Logs
