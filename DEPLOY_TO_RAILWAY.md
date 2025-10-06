# 🚀 Deploy Your MAAD Webhook to Railway

## ✅ Your Webhook is Ready!

Your webhook server is already running locally on port 3003. Now let's get it on Railway for a permanent URL!

---

## 📋 Step-by-Step Railway Deployment

### Step 1: Open Railway
Click this link: **https://railway.app/new**

### Step 2: Login with GitHub
- Click "Login with GitHub"
- Authorize Railway to access your repositories

### Step 3: Deploy Your Repository
1. Click "Deploy from GitHub repo"
2. Search for: `peggy12/maad-app`
3. Click on your repository
4. Click "Deploy Now"

Railway will automatically:
- ✅ Detect your `Procfile`
- ✅ Install dependencies from `package.json`
- ✅ Start your webhook with `node webhook-server.cjs`

### Step 4: Add Environment Variables
Once deployed, click on your project, then:

1. Click the "Variables" tab
2. Click "New Variable"
3. Add these one by one:

```
FACEBOOK_VERIFY_TOKEN
maad_verify_2025
```

```
FACEBOOK_ACCESS_TOKEN
EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
```

```
FACEBOOK_PAGE_ID
820172544505737
```

```
BASE44_API_KEY
d4c9f08499e944ef99621b19d45e9df3
```

```
BASE44_URL
https://manaboutadog.base44.app
```

4. Click "Add" for each variable

### Step 5: Get Your Production URL
1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Copy your URL (looks like: `https://maad-app-production-abc123.up.railway.app`)

Your webhook callback URL will be:
```
https://[your-railway-domain].up.railway.app/webhook
```

### Step 6: Configure Facebook Messenger
Now use your Railway URL in Facebook:

1. Go to: **https://developers.facebook.com**
2. Select your MAAD app
3. Click "Messenger" in the left sidebar
4. Click "Settings"
5. Scroll to "Webhooks"
6. Click "Add Callback URL"
7. Enter:
   - **Callback URL**: `https://[your-railway-domain].up.railway.app/webhook`
   - **Verify Token**: `maad_verify_2025`
8. Click "Verify and Save"

If verification succeeds ✅, subscribe to these events:
- ✅ `messages`
- ✅ `messaging_postbacks`
- ✅ `feed`

### Step 7: Test Your Production Webhook
Send a message to your Facebook Page and watch it respond!

You can also check the health endpoint:
```
https://[your-railway-domain].up.railway.app/health
```

---

## 🎯 What You'll Get

After deployment:
- ✅ **Permanent URL** for your webhook
- ✅ **Automatic SSL** (HTTPS)
- ✅ **24/7 uptime** (Railway keeps it running)
- ✅ **Auto-deploy** on git push (updates automatically)
- ✅ **Built-in monitoring** (Railway logs)

---

## 📊 Monitoring Your Deployment

### View Logs
In Railway dashboard:
1. Click your project
2. Click "Deployments" tab
3. Click the latest deployment
4. View live logs

### Check Status
Visit: `https://[your-domain].up.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "service": "MAAD Facebook Webhook",
  "uptime": 123.45,
  "timestamp": "2025-10-06T..."
}
```

---

## 🔧 Troubleshooting

### Deployment Failed?
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `webhook-server.cjs` is in your repository

### Webhook Verification Failed?
- Check `FACEBOOK_VERIFY_TOKEN` matches exactly: `maad_verify_2025`
- Verify URL ends with `/webhook`
- Check Railway logs during verification

### Not Receiving Messages?
- Verify webhook is subscribed to `messages` event
- Check `FACEBOOK_ACCESS_TOKEN` is valid
- Check `FACEBOOK_PAGE_ID` is correct: `820172544505737`
- View Railway logs to see incoming requests

---

## 💡 Pro Tips

1. **Custom Domain**: Railway allows custom domains (e.g., `webhook.yoursite.com`)
2. **Auto-Deploy**: Push to GitHub → Railway auto-updates
3. **Environment Variables**: Update in Railway dashboard anytime
4. **Logs**: Railway keeps 7 days of logs for debugging
5. **Scaling**: Railway automatically scales with traffic

---

## ✅ Success Checklist

- [ ] Railway account created
- [ ] Repository deployed
- [ ] Environment variables added
- [ ] Domain generated
- [ ] Facebook webhook configured
- [ ] Webhook verified successfully
- [ ] Events subscribed (messages, feed)
- [ ] Test message sent and received response

---

## 🎊 You're Done!

Your MAAD webhook is now live in production! 

**Next Steps:**
1. Test by sending messages to your Facebook Page
2. Monitor responses in Railway logs
3. Share your Facebook Page with users
4. Watch your AI bot respond automatically!

**Your permanent callback URL:**
```
https://[your-railway-domain].up.railway.app/webhook
```

Save this URL - you'll need it for Facebook configuration!

---

## 📚 Additional Resources

- Railway Documentation: https://docs.railway.app
- Facebook Messenger Platform: https://developers.facebook.com/docs/messenger-platform
- Your webhook server code: `webhook-server.cjs`
- Your deployment config: `railway.json` and `Procfile`

**Need help?** Check the Railway logs first - they show exactly what's happening!
