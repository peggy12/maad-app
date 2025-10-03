# MAAD App - Production Deployment Guide

## 🚀 Quick Deployment to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

---

## Method 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial MAAD app deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/MAAD-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite settings
5. Add environment variables:
   - `VITE_FACEBOOK_PAGE_ID` = `820172544505737`
   - `VITE_FACEBOOK_ACCESS_TOKEN` = `YOUR_TOKEN`
   - `VITE_BASE44_BASE_URL` = `https://manaboutadog.base44.app`
   - `VITE_BASE44_AGENT_NAME` = `MAAD`
   - `VITE_BASE44_API_KEY` = `d4c9f08499e944ef99621b19d45e9df3`

6. Click "Deploy"
7. Your app will be live at `https://your-app.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From your MAAD-app directory
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: maad-app
# - Framework preset: Vite
```

### Step 4: Set Environment Variables
```bash
vercel env add VITE_FACEBOOK_PAGE_ID production
# Enter: 820172544505737

vercel env add VITE_FACEBOOK_ACCESS_TOKEN production
# Enter your token

vercel env add VITE_BASE44_BASE_URL production
# Enter: https://manaboutadog.base44.app

vercel env add VITE_BASE44_AGENT_NAME production
# Enter: MAAD

vercel env add VITE_BASE44_API_KEY production
# Enter: d4c9f08499e944ef99621b19d45e9df3
```

### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## Method 3: Deploy to Netlify

### Via Netlify Dashboard:
1. Go to https://netlify.com
2. Drag and drop your `dist` folder after building:
   ```bash
   npm run build
   ```
3. Add environment variables in Site Settings → Environment Variables

### Via Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## Method 4: GitHub Pages (Free Static Hosting)

### Step 1: Add GitHub Pages Config
Add to `vite.config.js`:
```javascript
export default defineConfig({
  base: '/MAAD-app/', // Your repo name
  // ... rest of config
})
```

### Step 2: Install gh-pages
```bash
npm install --save-dev gh-pages
```

### Step 3: Add Deploy Script to package.json
```json
"scripts": {
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

### Step 4: Deploy
```bash
npm run deploy
```

Your app will be at: `https://YOUR_USERNAME.github.io/MAAD-app/`

---

## 🔒 Security Notes

### Production Environment Variables
**IMPORTANT:** Never commit `.env` file to GitHub!

Your `.gitignore` should include:
```
.env
.env.local
.env.production
node_modules/
dist/
```

### Facebook Token Management
- Current token expires in ~60 days
- Generate long-lived token: https://developers.facebook.com/tools/debug/accesstoken/
- Set up token refresh reminders

---

## 🎯 What Gets Deployed

Your deployed app includes:
- ✅ React chat interface
- ✅ Base44 AI agent iframe (fully functional)
- ✅ Facebook job search functionality
- ✅ Analytics dashboard
- ✅ All environment variables (securely stored)

---

## 📱 Custom Domain Setup

### After Deployment:
1. **On Vercel/Netlify:** Go to Settings → Domains
2. Add your domain (e.g., `maad.co.uk`)
3. Update DNS records with your domain provider:
   - Add CNAME record pointing to Vercel/Netlify

**Example DNS Settings:**
```
Type: CNAME
Name: www
Value: your-app.vercel.app
```

---

## 🧪 Testing Production Build Locally

Before deploying, test the production build:

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

Open http://localhost:4173 to test

---

## 📊 Post-Deployment Checklist

After deployment:
- [ ] Test Base44 chat widget works
- [ ] Test Facebook job search
- [ ] Verify environment variables loaded correctly
- [ ] Check all links and navigation
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure Facebook webhook URL to production domain

---

## 🔄 Continuous Deployment

With Vercel/Netlify + GitHub:
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Automatic rollbacks if deployment fails

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
