# 🤖 MAAD Deployment Automation Helper

## What I've Done For You

✅ **Created deployment files:**
- `webhook-server.cjs` - Your production webhook server
- `railway.json` - Railway configuration (auto-detected)
- `Procfile` - Start command (node webhook-server.cjs)
- `package.json` - All dependencies configured

✅ **Pushed to GitHub:**
- Repository: `peggy12/maad-app`
- Branch: `master`
- Commit: 4273750
- Status: ✅ All files synced

✅ **Configured for deployment:**
- Port: Auto-detect (Railway uses PORT env var)
- Runtime: Node.js
- Dependencies: Express, node-fetch, etc.
- Health check: /health endpoint

✅ **Documentation created:**
- `DEPLOY_TO_RAILWAY.md` - Complete guide
- `DEPLOYMENT_CARD.txt` - Quick reference
- `DEPLOY_NOW.md` - Step-by-step instructions
- `READY_TO_DEPLOY.md` - Quick start

---

## What You Need To Do

Since I can't login to Railway for you, you need to:

### 🔐 Step 1: Login to Railway (1 minute)
1. Browser opened to: https://railway.app/new
2. Click "Login with GitHub"
3. Authorize Railway

### 📦 Step 2: Deploy (2 minutes)
1. Click "Deploy from GitHub repo"
2. Select `peggy12/maad-app`
3. Click "Deploy Now"
4. Wait for deployment (Railway auto-installs everything)

### 🔑 Step 3: Add Environment Variables (1 minute)
Click "Variables" tab and add these 5 variables:

**Copy-paste these (one at a time):**

**Variable 1:**
```
Name: FACEBOOK_VERIFY_TOKEN
Value: maad_verify_2025
```

**Variable 2:**
```
Name: FACEBOOK_ACCESS_TOKEN
Value: EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
```

**Variable 3:**
```
Name: FACEBOOK_PAGE_ID
Value: 820172544505737
```

**Variable 4:**
```
Name: BASE44_API_KEY
Value: d4c9f08499e944ef99621b19d45e9df3
```

**Variable 5:**
```
Name: BASE44_URL
Value: https://manaboutadog.base44.app
```

### 🌐 Step 4: Get Your URL (30 seconds)
1. Go to "Settings" tab
2. Click "Domains" section
3. Click "Generate Domain"
4. Copy your URL

Your callback URL will be:
```
https://[generated-domain].up.railway.app/webhook
```

### 🔗 Step 5: Configure Facebook (1 minute)
1. Go to: https://developers.facebook.com
2. Select your app
3. Messenger → Settings → Webhooks
4. Add Callback URL: `https://[your-railway-url]/webhook`
5. Verify Token: `maad_verify_2025`
6. Click "Verify and Save"
7. Subscribe to: messages, messaging_postbacks, feed

---

## ✅ Deployment Checklist

Print this and check off as you go:

- [ ] Opened Railway: https://railway.app/new
- [ ] Logged in with GitHub
- [ ] Selected peggy12/maad-app repository
- [ ] Clicked "Deploy Now"
- [ ] Waited for deployment to complete
- [ ] Added FACEBOOK_VERIFY_TOKEN variable
- [ ] Added FACEBOOK_ACCESS_TOKEN variable
- [ ] Added FACEBOOK_PAGE_ID variable
- [ ] Added BASE44_API_KEY variable
- [ ] Added BASE44_URL variable
- [ ] Generated Railway domain
- [ ] Copied Railway URL
- [ ] Opened Facebook Developer Console
- [ ] Added callback URL to Messenger
- [ ] Entered verify token
- [ ] Verified webhook successfully
- [ ] Subscribed to events (messages, feed)
- [ ] Tested by sending message to Page

---

## 🎯 Expected Results

### After Railway Deployment:
```
✅ Build successful
✅ Deployment active
✅ Server running on port [auto-assigned]
✅ Health check passing
```

### After Facebook Configuration:
```
✅ Webhook verified
✅ Events subscribed
✅ Page connected
✅ Ready to receive messages
```

### After Testing:
```
✅ Message sent to Page
✅ Webhook received event
✅ AI generated response
✅ Response sent to user
```

---

## 🚨 Quick Troubleshooting

### Railway deployment fails?
- Check Railway logs (Deployments tab)
- Verify all files committed to GitHub
- Check `package.json` has all dependencies

### Webhook verification fails?
- Verify token must be exactly: `maad_verify_2025`
- URL must end with `/webhook`
- Check Railway is running (green status)

### Not receiving messages?
- Check events are subscribed in Facebook
- Verify ACCESS_TOKEN is correct
- Check Railway logs for incoming requests

---

## 📞 Need Help?

If you get stuck:
1. Check Railway logs first
2. Review `DEPLOY_TO_RAILWAY.md` for detailed steps
3. Check `DEPLOYMENT_CARD.txt` for quick reference

---

## 🎊 Success!

Once complete, your MAAD bot will:
- ✅ Automatically respond to Facebook messages
- ✅ Reply to comments with AI responses
- ✅ Track conversations persistently
- ✅ Run 24/7 on Railway infrastructure

**Total time: ~5 minutes**

**You've got this!** 🚀

---

## 📋 Your Configuration Summary

| Setting | Value |
|---------|-------|
| **Webhook Server** | webhook-server.cjs |
| **Port** | Auto-assigned by Railway |
| **GitHub Repo** | peggy12/maad-app |
| **Branch** | master |
| **Runtime** | Node.js |
| **Framework** | Express 5.1.0 |
| **Verify Token** | maad_verify_2025 |
| **Page ID** | 820172544505737 |
| **Callback Path** | /webhook |
| **Health Check** | /health |

---

**Start now:** Railway is open in your browser → Login → Deploy! 🎯
