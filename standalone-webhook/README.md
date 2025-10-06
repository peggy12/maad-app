# MAAD Webhook Server

A standalone Express.js server for handling Facebook webhook events for the MAAD application.

## Features

- ✅ Facebook webhook verification
- 📢 Event processing for page subscriptions
- 🔍 Detailed logging
- 🚀 Easy deployment to Railway, Render, or Heroku

## Quick Deploy

### Railway
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub account
3. Deploy this repository
4. Your webhook will be available at: `https://your-app.railway.app/webhook`

### Environment Variables

- `PORT`: Automatically set by hosting platform
- Verify token: `maadlad_verify_token` (hardcoded in server.js)

## Endpoints

- `GET /` - Health check
- `GET /webhook` - Facebook webhook verification
- `POST /webhook` - Facebook webhook events

## Usage

1. Deploy to your chosen platform
2. Get your webhook URL (e.g., `https://your-app.railway.app/webhook`)
3. In Facebook Developer Console:
   - Callback URL: `https://your-app.railway.app/webhook`
   - Verify Token: `maadlad_verify_token`

## Local Development

```bash
npm install
npm start
```

Server will run on http://localhost:3000