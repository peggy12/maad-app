# 🚀 Deploy MAAD Webhook to Production

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

#### Step 1: Prepare for Deployment
```bash
# Make sure your code is committed
git add .
git commit -m "Ready for deployment"
```

#### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `peggy12/maad-app`
6. Railway will auto-detect and deploy!

#### Step 3: Configure Environment Variables
In Railway dashboard:
- Click your project → Variables tab
- Add these:
```bash
FACEBOOK_VERIFY_TOKEN=maad_verify_2025
FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
FACEBOOK_PAGE_ID=820172544505737
BASE44_API_KEY=d4c9f08499e944ef99621b19d45e9df3
BASE44_URL=https://manaboutadog.base44.app
```

#### Step 4: Get Your Callback URL
Railway will give you a URL like:
```
https://maad-app-production.up.railway.app
```

Your webhook callback URL will be:
```
https://maad-app-production.up.railway.app/webhook
```

---

### Option 2: Render (Also Free & Easy)

#### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo: `peggy12/maad-app`
3. Configure:
   - **Name:** `maad-webhook`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node webhook-server.cjs`
   - **Plan:** Free

#### Step 3: Add Environment Variables
Same as Railway above

#### Step 4: Get Your URL
```
https://maad-webhook.onrender.com/webhook
```

---

### Option 3: Vercel (Requires Serverless Function)

You already have Vercel set up! Let me create the serverless function for you.

---

## 🎯 I Recommend Railway

**Why?**
- ✅ Easiest setup (5 minutes)
- ✅ Free tier perfect for this
- ✅ No configuration needed
- ✅ Permanent URL
- ✅ Auto-deploys on git push
- ✅ Built-in logs and monitoring

**Which would you like to use?**
1. Railway (easiest)
2. Render (also easy)
3. Vercel (need to create serverless function)

Let me know and I'll create the deployment files you need!
