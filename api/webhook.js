// Vercel webhook endpoint for Facebook
export default function handler(req, res) {
  // Handle Facebook webhook verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token
    if (mode === 'subscribe' && token === 'maadlad_verify_token') {
      console.log('✅ Webhook verified');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      res.status(403).send('Forbidden');
    }
  }
  
  // Handle Facebook webhook events
  else if (req.method === 'POST') {
    const body = req.body;
    
    // Verify this is a page subscription
    if (body.object === 'page') {
      console.log('📢 Facebook webhook event received');
      
      // Process each entry
      body.entry?.forEach((entry) => {
        entry.changes?.forEach((change) => {
          if (change.field === 'feed') {
            const post = change.value;
            if (post.message) {
              console.log('📝 New post:', post.message.substring(0, 100) + '...');
              // Here you would process the job post
            }
          }
        });
      });
      
      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.status(404).send('Not Found');
    }
  }
  
  else {
    res.status(405).send('Method Not Allowed');
  }
}