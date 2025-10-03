# MAAD App Deployment Guide

Your MAAD app has multiple deployment options depending on your needs. Here are the recommended approaches:

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for React App)
Perfect for hosting the React chat interface with automatic builds.

### Option 2: Railway (Full-Stack Deployment)
Great for both React app and webhook server with database support.

### Option 3: DigitalOcean App Platform
Good for production with custom domains and scaling.

### Option 4: Self-Hosted VPS
Complete control for enterprise deployment.

## 📦 Build Your App First

```bash
# Build the React app for production
npm run build

# This creates a 'dist' folder with optimized files
```

## 🌐 Option 1: Vercel Deployment (Easiest)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
# From your project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Link to existing project? N
# - Project name: maad-app
# - Directory: ./
# - Override settings? N
```

### Step 3: Environment Variables in Vercel
Add these in Vercel Dashboard → Project → Settings → Environment Variables:
```
VITE_FACEBOOK_PAGE_ID=820172544505737
VITE_FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
VITE_BASE44_AGENT_NAME=quote_assistant
```

## 🚂 Option 2: Railway Deployment (Full-Stack)

### Step 1: Create Railway Account
- Go to railway.app
- Connect your GitHub account

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial MAAD app deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy on Railway
- Connect GitHub repo in Railway
- Add environment variables in Railway dashboard
- Automatic deployment on git push

## 🌊 Option 3: DigitalOcean App Platform

### Step 1: Create App Spec
```yaml
name: maad-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/maad-app
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: VITE_FACEBOOK_PAGE_ID
    value: "820172544505737"
  - key: VITE_FACEBOOK_ACCESS_TOKEN
    value: "YOUR_TOKEN_HERE"
```

## 🖥️ Option 4: Self-Hosted VPS

### Step 1: Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Deploy Your App
```bash
# Clone your repo
git clone YOUR_REPO_URL /var/www/maad-app
cd /var/www/maad-app

# Install dependencies
npm install

# Build the app
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/maad-app/dist;
        try_files $uri $uri/ /index.html;
    }

    location /webhook {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📱 Facebook Webhook Configuration

After deployment, configure your Facebook webhook:

### Step 1: Get Your Webhook URL
- Vercel: `https://your-app.vercel.app/webhook`
- Railway: `https://your-app.railway.app/webhook`
- Custom domain: `https://your-domain.com/webhook`

### Step 2: Facebook Developer Settings
1. Go to Facebook Developers Console
2. Your App → Webhooks → Page
3. Callback URL: Your webhook URL
4. Verify Token: `maadlad_verify_token`
5. Subscribe to: `feed` events

### Step 3: Test Webhook
```bash
# Test webhook verification
curl "https://your-app.vercel.app/webhook?hub.mode=subscribe&hub.verify_token=maadlad_verify_token&hub.challenge=test123"

# Should return: test123
```

## 🔐 Security Configuration

### Environment Variables (Production)
Never commit these to Git! Use platform environment settings:

```bash
# Facebook Integration
FACEBOOK_PAGE_ID=820172544505737
FACEBOOK_ACCESS_TOKEN=your_production_token

# Base44 Integration
BASE44_API_KEY=your_base44_key
BASE44_AGENT_NAME=quote_assistant

# Security
WEBHOOK_VERIFY_TOKEN=maadlad_verify_token
JWT_SECRET=your_jwt_secret_key
```

## 📊 Monitoring & Logging

### Production Logging
```javascript
// Add to your webhook server
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check Endpoint
```javascript
// Add to webhook-server.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

## 🚀 Deployment Checklist

- [ ] Build React app (`npm run build`)
- [ ] Set environment variables
- [ ] Configure Facebook webhook URL  
- [ ] Test webhook verification
- [ ] Test job search functionality
- [ ] Test Base44 integration
- [ ] Set up domain (optional)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring
- [ ] Configure backups

## 🔧 Troubleshooting

### Common Issues:
1. **Build Failures**: Check TypeScript errors with `npm run build`
2. **Webhook Not Receiving**: Verify Facebook app settings
3. **Environment Variables**: Check platform-specific env var syntax
4. **CORS Issues**: Add proper CORS headers for production

### Debug Commands:
```bash
# Check build output
npm run build

# Preview production build locally  
npm run preview

# Test webhook locally
npm run webhook
```

Choose your preferred deployment option and I'll help you set it up! Which option interests you most?