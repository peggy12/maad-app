# 🚀 MAAD App - Quick Start Guide

## Get Started in 3 Steps

### Step 1: Start the Webhook Server
```bash
npm run webhook
```
✅ Server runs on http://localhost:3003

### Step 2: Start the React App
```bash
npm run dev
```
✅ App runs on http://localhost:3001

### Step 3: Test It
```bash
# In a new terminal
curl http://localhost:3003/health
```
✅ Should return `{"status":"ok"...}`

## That's It! 🎉

Your MAAD app is now running with:
- ✅ AI-powered chat interface
- ✅ Facebook Messenger webhook
- ✅ Job search functionality
- ✅ Conversation memory
- ✅ Context awareness

## Next Steps

### Connect to Facebook
1. Install ngrok: `npm install -g ngrok`
2. Expose webhook: `ngrok http 3003`
3. Configure Facebook App with ngrok URL
4. Test by messaging your Facebook Page

### Customize Responses
Edit `webhook-server.cjs` → `generateFallbackResponse()` function

### Deploy to Production
See `WEBHOOK_SETUP.md` for deployment guides (Railway, Render, Vercel)

## Common Commands

```bash
npm run dev          # Start React app
npm run webhook      # Start webhook server
npm run webhook:ts   # Start TypeScript webhook
npm test            # Test webhook endpoints
npm run build       # Build for production
```

## Troubleshooting

**Port already in use?**
- Change PORT in webhook-server.cjs
- Or stop other services: `taskkill /f /im node.exe`

**Webhook not responding?**
- Check server is running: `curl http://localhost:3003/health`
- Check logs in terminal

**React app issues?**
- Clear cache: Delete node_modules, run `npm install`
- Check port 3001 is free

## Support

- 📖 Full docs: See `README.md`
- 🔧 Webhook setup: See `WEBHOOK_SETUP.md`
- 🎯 Testing guide: See `TESTING_GUIDE.md`
- 💡 AI features: See `ADVANCED_AI_FEATURES.md`
- 🐛 Code fixes: See `CODE_FIX_SUMMARY.md`

---

**You're all set!** The MAAD app is fixed and ready to use. 🚀
