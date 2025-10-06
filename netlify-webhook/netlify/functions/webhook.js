exports.handler = async (event, context) => {
  console.log('🚀 MAAD Webhook called:', event.httpMethod, event.queryStringParameters);
  
  // Handle Facebook webhook verification (GET request)
  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.['hub.mode'];
    const token = event.queryStringParameters?.['hub.verify_token'];
    const challenge = event.queryStringParameters?.['hub.challenge'];
    
    console.log('🔍 Verification request:', { mode, token: token ? 'present' : 'missing', challenge: challenge ? 'present' : 'missing' });
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === 'maadlad_verify_token') {
      console.log('✅ Webhook verified successfully!');
      return {
        statusCode: 200,
        body: challenge,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } else {
      console.log('❌ Webhook verification failed');
      return {
        statusCode: 403,
        body: 'Forbidden - verification failed',
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    }
  }
  
  // Handle Facebook webhook events (POST request)
  else if (event.httpMethod === 'POST') {
    console.log('📢 Facebook webhook event received');
    
    try {
      const body = JSON.parse(event.body || '{}');
      console.log('📝 Event data:', JSON.stringify(body, null, 2));
      
      // Verify this is a page subscription
      if (body.object === 'page') {
        console.log('✅ Page subscription event confirmed');
        
        // Process each entry
        body.entry?.forEach((entry) => {
          console.log('📄 Processing entry:', entry.id);
          
          entry.changes?.forEach((change) => {
            if (change.field === 'feed') {
              const post = change.value;
              console.log('🔍 Feed change detected:', {
                postId: post.post_id,
                message: post.message ? post.message.substring(0, 100) + '...' : 'No message',
                createdTime: post.created_time
              });
              
              if (post.message) {
                console.log('📝 New post content:', post.message);
              }
            }
          });
        });
        
        return {
          statusCode: 200,
          body: 'EVENT_RECEIVED',
          headers: {
            'Content-Type': 'text/plain'
          }
        };
      } else {
        console.log('❌ Not a page subscription event:', body.object);
        return {
          statusCode: 404,
          body: 'Not a page subscription',
          headers: {
            'Content-Type': 'text/plain'
          }
        };
      }
    } catch (error) {
      console.error('💥 Error parsing webhook event:', error);
      return {
        statusCode: 400,
        body: 'Bad Request - Invalid JSON',
        headers: {
          'Content-Type': 'text/plain'
        }
      };
    }
  }
  
  // Handle other HTTP methods
  else {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: {
        'Content-Type': 'text/plain'
      }
    };
  }
};