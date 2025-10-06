# 🎯 Your Facebook Messenger Callback URL

## For Local Testing

**Step 1:** Start your webhook
```bash
npm run webhook
```

**Step 2:** Start ngrok
```bash
ngrok http 3003
```

**Your Callback URL:**
```
https://[random].ngrok-free.app/webhook
```

Example: `https://abc123def.ngrok-free.app/webhook`

---

## For Production (Permanent URL)

### ✅ I've prepared everything for Railway deployment!

**Your Production Callback URL will be:**
```
https://maad-app-production.up.railway.app/webhook
```

### Deploy Now (5 Minutes):

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Production webhook ready"
   git push origin master
   ```

2. **Deploy to Railway:**
   - Visit: https://railway.app
   - Login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `peggy12/maad-app`
   - Click "Deploy"

3. **Add Environment Variables** (in Railway dashboard):
   - Click your project
   - Go to "Variables" tab
   - Add:
     ```
     FACEBOOK_VERIFY_TOKEN=maad_verify_2025
     FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
     FACEBOOK_PAGE_ID=820172544505737
     ```

4. **Copy your Railway URL** (looks like `https://maad-app-production.up.railway.app`)

5. **Configure Facebook Messenger:**
   - Go to https://developers.facebook.com
   - Select your app
   - Messenger → Settings → Webhooks
   - **Callback URL:** `https://your-railway-url.up.railway.app/webhook`
   - **Verify Token:** `maad_verify_2025`
   - Click "Verify and Save"
   - Subscribe to: `messages`, `messaging_postbacks`, `feed`

---

## 📋 Quick Reference

| Environment | Callback URL | Verify Token |
|-------------|--------------|--------------|
| **Local (ngrok)** | `https://[random].ngrok-free.app/webhook` | `maad_verify_2025` |
| **Production** | `https://[your-app].up.railway.app/webhook` | `maad_verify_2025` |

---

## ✅ Files Ready for Deployment

I've created:
- ✅ `railway.json` - Railway configuration
- ✅ `Procfile` - Start command
- ✅ `webhook-server.cjs` - Production webhook
- ✅ All dependencies in `package.json`

**You're ready to deploy!** Just follow the 5 steps above. 🚀
