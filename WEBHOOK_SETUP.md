# MAAD Webhook Setup Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```powershell
npm install express node-fetch
npm install --save-dev @types/express
```

### Step 2: Create Environment Variables

Create a `.env` file in your project root:

```bash
# Facebook Configuration
FACEBOOK_VERIFY_TOKEN=maad_verify_2025
FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
FACEBOOK_PAGE_ID=820172544505737

# Base44 Configuration
BASE44_API_KEY=d4c9f08499e944ef99621b19d45e9df3
BASE44_AGENT_NAME=MAAD
BASE44_BASE_URL=https://manaboutadog.base44.app

# Server Configuration
PORT=3000
NODE_ENV=production
```

### Step 3: Start the Webhook Server

```powershell
# Compile TypeScript
npx tsc webhook-server.ts --outDir dist --module nodenext --target es2022 --moduleResolution nodenext

# Run the server
node dist/webhook-server.js
```

Or add to your `package.json`:

```json
{
  "scripts": {
    "webhook": "tsx webhook-server.ts",
    "webhook:build": "tsc webhook-server.ts --outDir dist",
    "webhook:start": "node dist/webhook-server.js"
  }
}
```

Then run:
```powershell
npm run webhook
```

### Step 4: Expose Your Webhook (Development)

**Option A: Using ngrok (Recommended)**

```powershell
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Start ngrok
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

**Option B: Deploy to Production (See deployment section below)**

---

## 📋 Webhook Endpoints

### GET /webhook (Verification)
Facebook uses this to verify your webhook.

**Request:**
```
GET /webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123
```

**Response:**
- If token matches: Returns the challenge
- If token doesn't match: Returns 403 Forbidden

**Test it:**
```powershell
# Using curl
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123"

# Using PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123"
```

### POST /webhook (Receive Events)
Receives Facebook events (messages, posts, comments).

**Events Handled:**
- ✅ Messenger messages
- ✅ Facebook post comments
- ✅ New page posts
- ✅ Feed changes

**Response:**
Always returns `200 OK` with `EVENT_RECEIVED` immediately.

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "service": "MAAD Webhook Server"
}
```

---

## 🔧 Facebook Setup

### 1. Create/Configure Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing
3. Add "Messenger" product
4. Generate Page Access Token

### 2. Configure Webhook in Facebook

1. Go to Messenger Settings in your app
2. In "Webhooks" section, click "Add Callback URL"
3. Enter your webhook URL: `https://your-domain.com/webhook`
4. Enter verify token: `maad_verify_2025`
5. Select these subscription fields:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ message_deliveries
   - ✅ message_reads
   - ✅ feed (for page posts)

6. Click "Verify and Save"

### 3. Subscribe to Page

1. In "Webhooks" section
2. Click "Add Subscriptions"
3. Select your Facebook Page
4. Subscribe to events

---

## 🧪 Testing Your Webhook

### Test 1: Verify Endpoint Works

```powershell
# Test verification
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123"

# Expected output: test123
```

### Test 2: Test Message Handling

```powershell
# Send a test message
curl -X POST http://localhost:3000/webhook `
  -H "Content-Type: application/json" `
  -d '{
    "object": "page",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123456"},
        "recipient": {"id": "820172544505737"},
        "timestamp": 1234567890,
        "message": {
          "text": "Hello MAAD!"
        }
      }]
    }]
  }'
```

### Test 3: Check Health

```powershell
curl http://localhost:3000/health
```

---

## 📊 What Happens When a Message Arrives

1. **Facebook sends webhook** → Your server receives POST request
2. **Server responds immediately** → Returns 200 OK to Facebook
3. **Message is processed:**
   - Extracts sender ID and message text
   - Gets or creates conversation in IndexedDB
   - Saves user message to conversation memory
   - Generates AI response with context awareness
   - Saves AI response to conversation memory
   - Sends response back to Facebook Messenger
4. **User sees response** in Messenger

**Timeline:**
```
[0ms]   Facebook sends webhook
[5ms]   Server responds 200 OK
[10ms]  Conversation loaded from IndexedDB
[15ms]  Message saved to conversation
[20ms]  Context retrieved (last 10 messages)
[800ms] AI generates response (with cache)
[805ms] Response saved to conversation
[900ms] Response sent to Facebook
[1000ms] User sees message in Messenger
```

---

## 🚀 Production Deployment Options

### Option 1: Railway

1. Install Railway CLI:
```powershell
npm install -g railway
```

2. Login and deploy:
```powershell
railway login
railway init
railway up
```

3. Set environment variables in Railway dashboard
4. Get your Railway URL: `https://your-app.railway.app`

### Option 2: Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: maad-webhook
    env: node
    buildCommand: npm install && npm run webhook:build
    startCommand: npm run webhook:start
    envVars:
      - key: FACEBOOK_VERIFY_TOKEN
        sync: false
      - key: FACEBOOK_ACCESS_TOKEN
        sync: false
      - key: BASE44_API_KEY
        sync: false
```

2. Connect GitHub repo to Render
3. Deploy automatically on push

### Option 3: Vercel (Serverless)

Create `api/webhook.ts`:
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  } else if (req.method === 'POST') {
    // Handle webhook
    res.status(200).send('EVENT_RECEIVED');
    // Process event asynchronously
  }
}
```

Deploy:
```powershell
vercel deploy
```

### Option 4: Heroku

1. Create `Procfile`:
```
web: node dist/webhook-server.js
```

2. Deploy:
```powershell
heroku create maad-webhook
git push heroku main
heroku config:set FACEBOOK_VERIFY_TOKEN=maad_verify_2025
heroku config:set FACEBOOK_ACCESS_TOKEN=your_token
```

---

## 🔐 Security Best Practices

### 1. Validate Webhook Signature

Add to your webhook handler:

```typescript
import crypto from 'crypto';

function verifySignature(req: Request): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const elements = signature.split('=');
  const signatureHash = elements[1];

  const expectedHash = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return signatureHash === expectedHash;
}
```

### 2. Use Environment Variables

Never hardcode secrets! Always use `.env` file.

### 3. Rate Limiting

Add rate limiting middleware:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/webhook', limiter);
```

### 4. HTTPS Only

In production, always use HTTPS. Facebook requires it!

---

## 📈 Monitoring

### Add Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in your code
logger.info('Message received', { senderId, messageText });
logger.error('Failed to send message', { error });
```

### Health Checks

Set up monitoring service to ping `/health` endpoint every 5 minutes.

### Error Tracking

Integrate Sentry or similar:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN
});

app.use(Sentry.Handlers.errorHandler());
```

---

## 🐛 Troubleshooting

### Issue: Webhook Verification Fails

**Check:**
- Verify token matches exactly
- URL is accessible from internet (use ngrok for local)
- Server is running

**Test manually:**
```powershell
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test"
```

### Issue: Not Receiving Messages

**Check:**
- Facebook webhook is subscribed to correct events
- Page access token is valid
- App is in live mode (not development)
- Check server logs for errors

### Issue: AI Not Responding

**Check:**
- Base44 service initialized successfully
- Conversation memory working
- Check console for AI-related errors
- Verify Base44 API key is valid

### Issue: Slow Responses

**Solutions:**
- Use caching (already implemented)
- Deploy closer to users
- Use serverless with edge functions
- Implement response queuing

---

## 📋 Checklist

### Development Setup
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Server starts successfully
- [ ] Health endpoint responds
- [ ] Verification endpoint works

### Facebook Configuration
- [ ] Facebook app created
- [ ] Messenger product added
- [ ] Page access token generated
- [ ] Webhook URL configured
- [ ] Events subscribed
- [ ] Page subscribed to webhook

### Production Deployment
- [ ] Server deployed to production
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Facebook webhook updated with production URL
- [ ] Webhook verified successfully
- [ ] Test message sent and received

### Testing
- [ ] Send test message from Facebook
- [ ] AI responds correctly
- [ ] Context awareness working
- [ ] Messages persist in conversation memory
- [ ] Response times acceptable (<2s)

---

## 🎯 Quick Commands Reference

```powershell
# Start development server
npm run webhook

# Start with ngrok
ngrok http 3000

# Test verification
curl "http://localhost:3000/webhook?hub.mode=subscribe&hub.verify_token=maad_verify_2025&hub.challenge=test123"

# Test health
curl http://localhost:3000/health

# View logs
tail -f webhook.log

# Check if server is running
netstat -an | findstr :3000

# Kill server
taskkill /f /im node.exe
```

---

## 📚 Additional Resources

- [Facebook Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform)
- [Webhook Setup Guide](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [ngrok Documentation](https://ngrok.com/docs)
- [Express.js Documentation](https://expressjs.com/)

---

**Your webhook is ready! Follow the steps above to get it running.** 🚀