# MAAD Facebook Webhook

## Deployed URLs

**Your Facebook Webhook Settings:**
- **Callback URL**: `https://your-site-name.netlify.app/.netlify/functions/webhook`
- **Verify Token**: `maadlad_verify_token`

## Local Development

```bash
npm install
npx netlify dev
```

Local webhook will be available at: `http://localhost:8888/.netlify/functions/webhook`

## Deploy to Netlify

1. Create a new site on Netlify
2. Connect to this repository
3. Deploy automatically
4. Use the generated URL + `/.netlify/functions/webhook`