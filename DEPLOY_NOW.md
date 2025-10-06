# 🚀 DEPLOY TO RAILWAY - STEP BY STEP

## ✅ Code is Pushed to GitHub!

Your code is now on GitHub at: https://github.com/peggy12/maad-app

---

## 📝 Deploy to Railway (5 Minutes)

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** or **"Start a New Project"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub account

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **"peggy12/maad-app"** from the list
4. Railway will automatically:
   - Detect it's a Node.js project
   - Install dependencies
   - Start deploying!

### Step 3: Configure Environment Variables

1. Click on your deployed project
2. Go to the **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these one by one:

```
FACEBOOK_VERIFY_TOKEN=maad_verify_2025
```

```
FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
```

```
FACEBOOK_PAGE_ID=820172544505737
```

```
BASE44_API_KEY=d4c9f08499e944ef99621b19d45e9df3
```

```
BASE44_URL=https://manaboutadog.base44.app
```

5. Click **"Deploy"** if it doesn't auto-deploy

### Step 4: Get Your Production URL

1. Go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway URL
3. It will look like: `https://maad-app-production-abc123.up.railway.app`
4. **Copy this URL!**

### Step 5: Test Your Webhook

Open a new terminal or browser and test:

```bash
curl "https://your-railway-url.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123"
```

**Expected Response:** `test123`

If you see `test123`, your webhook is working! ✅

---

## 🎯 Configure Facebook Messenger

### Step 1: Go to Facebook Developers

1. Visit **https://developers.facebook.com**
2. Select your app (or create one if needed)
3. Click **"Messenger"** in the left sidebar
4. Click **"Settings"**

### Step 2: Configure Webhook

1. In the **"Webhooks"** section, click **"Add Callback URL"**
2. **Callback URL:** `https://your-railway-url.up.railway.app/webhook`
3. **Verify Token:** `maad_verify_2025`
4. Click **"Verify and Save"**

**You should see:** ✅ "Webhook verified successfully"

### Step 3: Subscribe to Events

1. Click **"Add Subscriptions"**
2. Select these events:
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **feed**
3. Click **"Save"**

### Step 4: Subscribe Page to App

1. In **"Access Tokens"** section
2. Click **"Add or Remove Pages"**
3. Select your Facebook Page
4. Generate a **Page Access Token**
5. **Copy the token** (you'll need this)

### Step 5: Update Environment Variable (if needed)

If you got a new Page Access Token:
1. Go back to Railway
2. Update `FACEBOOK_ACCESS_TOKEN` with your new token
3. Click **"Deploy"** to restart

---

## 🧪 Test Your Bot

### Test 1: Send a Message to Your Page

1. Go to your Facebook Page
2. Click **"Send Message"**
3. Type: **"Hello"**
4. **Expected:** Bot responds with MAAD services info

### Test 2: Check Railway Logs

1. In Railway dashboard, click **"Deployments"**
2. Click latest deployment
3. View **"Logs"**
4. You should see:
   ```
   📨 Received message event: { senderId: '...', message: 'Hello' }
   🤖 AI response: "..."
   ✅ Successfully replied to user
   ```

---

## ✅ Your Production URLs

After deployment, you'll have:

- **Webhook URL:** `https://your-railway-url.up.railway.app/webhook`
- **Health Check:** `https://your-railway-url.up.railway.app/health`
- **Facebook Callback:** Same as webhook URL

---

## 🎊 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created
- [ ] Project deployed on Railway
- [ ] Environment variables configured
- [ ] Railway URL obtained
- [ ] Webhook verified on Facebook
- [ ] Page subscribed to app
- [ ] Test message sent successfully
- [ ] Bot responded correctly

---

## 💡 Pro Tips

1. **Custom Domain:** Railway allows you to add a custom domain (optional)
2. **Monitoring:** Check Railway logs regularly for errors
3. **Scaling:** Railway auto-scales, no configuration needed
4. **Updates:** Push to GitHub → Railway auto-deploys!
5. **Cost:** Free tier includes $5/month credit (plenty for this app)

---

## 🆘 Troubleshooting

**Webhook verification fails?**
- Check verify token matches: `maad_verify_2025`
- Ensure Railway URL is correct (ends with `/webhook`)
- Check Railway logs for errors

**Bot doesn't respond?**
- Verify environment variables in Railway
- Check page is subscribed to app
- Review Railway logs for errors
- Test health endpoint: `https://your-url.up.railway.app/health`

**Railway deployment fails?**
- Check `package.json` has all dependencies
- Verify `Procfile` exists with: `web: node webhook-server.cjs`
- Check Railway build logs for errors

---

## 🎯 Next Steps

1. **Deploy now** using the steps above
2. **Test with real messages** on Facebook
3. **Monitor logs** in Railway dashboard
4. **Customize responses** in `webhook-server.cjs`
5. **Add features** as needed!

---

**Ready to deploy?** Follow the steps above! Your bot will be live in 5 minutes. 🚀

**Need help?** All deployment files are ready. Just follow Steps 1-5 above!
