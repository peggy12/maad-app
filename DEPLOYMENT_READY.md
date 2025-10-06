# MAAD Webhook - Production Deployment

## 🚀 Your Webhook is Ready to Deploy!

### Quick Deploy to Railway (5 minutes)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Production webhook ready"
   git push origin master
   ```

2. **Deploy to Railway**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Choose "Deploy from GitHub repo"
   - Select `peggy12/maad-app`
   - Railway will automatically deploy!

3. **Set Environment Variables** (in Railway dashboard)
   ```
   FACEBOOK_VERIFY_TOKEN=maad_verify_2025
   FACEBOOK_ACCESS_TOKEN=YOUR_TOKEN_HERE
   FACEBOOK_PAGE_ID=820172544505737
   ```

4. **Get Your Callback URL**
   - Railway gives you: `https://your-app.up.railway.app`
   - Your webhook URL: `https://your-app.up.railway.app/webhook`

5. **Configure Facebook Messenger**
   - Go to Facebook Developers Console
   - Messenger → Settings → Webhooks
   - Callback URL: `https://your-app.up.railway.app/webhook`
   - Verify Token: `maad_verify_2025`
   - Subscribe to: messages, messaging_postbacks, feed

## ✅ Files Created for Deployment

- `railway.json` - Railway configuration
- `Procfile` - Start command
- `webhook-server.cjs` - Your production webhook
- `package.json` - Dependencies

## 🎯 Your Callback URL Will Be

```
https://[your-railway-subdomain].up.railway.app/webhook
```

## 📊 Monitoring

Railway provides:
- ✅ Deployment logs
- ✅ Runtime logs  
- ✅ Metrics
- ✅ Automatic SSL
- ✅ Custom domains (optional)

---

**Ready to deploy?** Just follow the 5 steps above!
