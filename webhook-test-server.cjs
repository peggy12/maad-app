// Test your webhook locally first
import express from 'express';
const app = express();
const port = 3001;

app.use(express.json());

// Facebook webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📞 Webhook verification request:');
  console.log('  Mode:', mode);
  console.log('  Token:', token);
  console.log('  Challenge:', challenge);

  if (mode === 'subscribe' && token === 'maadlad_verify_token') {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

// Facebook webhook events
app.post('/webhook', (req, res) => {
  const body = req.body;
  
  console.log('📢 Webhook event received:', JSON.stringify(body, null, 2));
  
  if (body.object === 'page') {
    body.entry?.forEach((entry) => {
      entry.changes?.forEach((change) => {
        if (change.field === 'feed') {
          const post = change.value;
          console.log('📝 New Facebook post detected:');
          console.log('  Post ID:', post.id);
          console.log('  Message:', post.message?.substring(0, 100) + '...');
          
          // Here you would analyze if it's a job post
          // and potentially respond via Base44
        }
      });
    });
    
    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('❓ Unknown webhook object:', body.object);
    res.status(404).send('Not Found');
  }
});

app.listen(port, () => {
  console.log(`🚀 Webhook server running on http://localhost:${port}`);
  console.log(`📍 Webhook URL: http://localhost:${port}/webhook`);
  console.log(`🔗 For Facebook: You'll need to expose this with ngrok or similar`);
});

// Test endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'MAAD Webhook Server Running',
    webhookUrl: '/webhook',
    verifyToken: 'maadlad_verify_token'
  });
});