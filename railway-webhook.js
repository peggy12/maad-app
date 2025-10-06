// Railway webhook server for Facebook
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'MAAD Webhook Server Running',
    timestamp: new Date().toISOString(),
    endpoints: ['/webhook']
  });
});

// Facebook webhook endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('🔍 Webhook verification request:', { mode, token, challenge });

  // Verify token
  if (mode === 'subscribe' && token === 'maadlad_verify_token') {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    console.log('Expected token: maadlad_verify_token, Received:', token);
    res.status(403).send('Forbidden');
  }
});

// Handle Facebook webhook events
app.post('/webhook', (req, res) => {
  const body = req.body;
  
  console.log('📢 Facebook webhook event received:', JSON.stringify(body, null, 2));
  
  // Verify this is a page subscription
  if (body.object === 'page') {
    // Process each entry
    body.entry?.forEach((entry) => {
      console.log('📋 Processing entry:', entry.id);
      
      entry.changes?.forEach((change) => {
        console.log('🔄 Processing change:', change.field);
        
        if (change.field === 'feed') {
          const post = change.value;
          if (post.message) {
            console.log('📝 New post detected:', post.message.substring(0, 100) + '...');
            // Here you would integrate with your MAAD job detection logic
            // and potentially use Base44 AI to analyze and respond
          }
        }
      });
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('❓ Unknown webhook object:', body.object);
    res.status(404).send('Not Found');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 MAAD webhook server running on port ${port}`);
  console.log(`📍 Webhook URL: https://your-app.railway.app/webhook`);
  console.log(`🔑 Verify token: maadlad_verify_token`);
});