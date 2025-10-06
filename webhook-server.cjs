/**
 * Standalone Facebook Messenger Webhook Server
 * Works independently from the React app
 * Handles incoming messages and posts from Facebook
 */

const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'maad_verify_2025';
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '820172544505737';
const BASE44_API_KEY = process.env.BASE44_API_KEY || 'd4c9f08499e944ef99621b19d45e9df3';
const BASE44_URL = process.env.BASE44_URL || 'https://manaboutadog.base44.app';

// Simple in-memory conversation storage
const conversations = new Map();

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'facebook-webhook',
    port: PORT,
    conversations: conversations.size
  });
});

/**
 * Webhook verification (GET /webhook)
 * Facebook will call this to verify your endpoint
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📥 Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed - token mismatch');
    res.sendStatus(403);
  }
});

/**
 * Webhook event handler (POST /webhook)
 * Facebook will POST here when events occur
 */
app.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('📨 Received webhook event:', JSON.stringify(body, null, 2));

  // Check if this is a page event
  if (body.object === 'page') {
    // Return 200 OK immediately so Facebook doesn't retry
    res.status(200).send('EVENT_RECEIVED');

    // Process all entries
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        // Process messaging events (direct messages)
        if (entry.messaging && Array.isArray(entry.messaging)) {
          for (const event of entry.messaging) {
            await handleMessagingEvent(event).catch(err => {
              console.error('❌ Error handling messaging event:', err);
            });
          }
        }

        // Process feed changes (posts/comments)
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            await handleFeedChange(change).catch(err => {
              console.error('❌ Error handling feed change:', err);
            });
          }
        }
      }
    }
  } else {
    // Not a page event
    res.sendStatus(404);
  }
});

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle messaging events (direct messages)
 */
async function handleMessagingEvent(event) {
  const senderId = event.sender?.id;
  const timestamp = event.timestamp;
  const message = event.message;

  console.log('📨 Processing message:', { senderId, timestamp, text: message?.text });

  // Ignore messages sent by the page or without text
  if (!message?.text || !senderId) {
    console.log('⏭️  Skipping message (no text or sender)');
    return;
  }

  try {
    const messageText = message.text;
    const conversationId = `messenger_${senderId}`;
    
    // Store message in memory
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    conversations.get(conversationId).push({
      role: 'user',
      content: messageText,
      timestamp: new Date(timestamp)
    });

    console.log(`💬 User message: "${messageText}"`);

    // Get AI response
    const response = await generateAIResponse(messageText, conversationId);
    
    // Store AI response
    conversations.get(conversationId).push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    console.log(`🤖 AI response: "${response}"`);

    // Send response back to user
    await sendMessage(senderId, response);
    
    console.log('✅ Successfully replied to user:', senderId);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    try {
      await sendMessage(senderId, "Sorry, I encountered an error. Please try again.");
    } catch (sendError) {
      console.error('❌ Error sending error message:', sendError);
    }
  }
}

/**
 * Handle feed changes (posts/comments)
 */
async function handleFeedChange(change) {
  const field = change.field;
  const value = change.value;

  console.log('📝 Processing feed change:', { field, item: value?.item });

  // Handle post comments
  if (field === 'feed' && value.item === 'comment') {
    const commentId = value.comment_id;
    const postId = value.post_id;
    const senderId = value.from?.id;
    const message = value.message;

    console.log('💬 New comment:', { postId, commentId, senderId, message });

    try {
      const conversationId = `post_${postId}_user_${senderId}`;
      
      // Store comment
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, []);
      }
      conversations.get(conversationId).push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Get AI response
      const response = await generateAIResponse(message, conversationId);
      
      // Store AI response
      conversations.get(conversationId).push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      // Post reply to comment
      await postComment(commentId, response);
      
      console.log('✅ Successfully replied to comment:', commentId);
    } catch (error) {
      console.error('❌ Error handling comment:', error);
    }
  }
}

// ============================================================================
// AI RESPONSE GENERATION
// ============================================================================

/**
 * Generate AI response using Base44 or fallback to simple responses
 */
async function generateAIResponse(userMessage, conversationId) {
  // Try Base44 API first
  try {
    const response = await fetch(`${BASE44_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BASE44_API_KEY}`
      },
      body: JSON.stringify({
        message: userMessage,
        conversationId: conversationId
      }),
      timeout: 10000
    });

    if (response.ok) {
      const data = await response.json();
      return data.message || data.response || generateFallbackResponse(userMessage);
    }
  } catch (error) {
    console.log('⚠️  Base44 API not available, using fallback response');
  }

  // Fallback to simple responses
  return generateFallbackResponse(userMessage);
}

/**
 * Generate simple fallback responses
 */
function generateFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Job search queries
  if (msg.includes('job') || msg.includes('work') || msg.includes('hiring')) {
    return "I can help you search for jobs on Facebook! Try asking:\n• 'search facebook jobs'\n• 'find jobs limit 50'\n• 'search jobs score 0.7'";
  }
  
  // Clearance/handyman services
  if (msg.includes('clearance') || msg.includes('junk') || msg.includes('rubbish')) {
    return "Man About A Dog provides professional clearance services! We handle house clearances, junk removal, and more. Would you like a quote?";
  }
  
  if (msg.includes('handyman') || msg.includes('repair') || msg.includes('fix')) {
    return "We offer professional handyman services! From repairs to maintenance, we've got you covered. What do you need help with?";
  }
  
  // Quote requests
  if (msg.includes('quote') || msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    return "I'd be happy to provide a quote! Please tell me:\n• What service do you need?\n• Location\n• Any specific requirements\n\nYou can also call us directly for an immediate quote.";
  }
  
  // Booking/scheduling
  if (msg.includes('book') || msg.includes('schedule') || msg.includes('appointment') || msg.includes('when can you')) {
    return "I can help you schedule a service! What day and time works best for you? Please also let me know:\n• Service needed\n• Your location\n• Any urgent requirements";
  }
  
  // Greetings
  if (msg.match(/\b(hi|hello|hey|greetings)\b/)) {
    return "Hello! 👋 I'm MAAD (Man About A Dog), your AI assistant. I can help you with:\n• House clearances\n• Handyman services\n• Job search on Facebook\n• Quotes and bookings\n\nHow can I assist you today?";
  }
  
  // Thanks
  if (msg.match(/\b(thanks|thank you|cheers)\b/)) {
    return "You're welcome! Feel free to reach out anytime you need help. 😊";
  }
  
  // Default response
  return `Thanks for your message! Man About A Dog (MAAD) offers:\n\n🏠 House Clearances\n🔧 Handyman Services\n💼 Job Search Help\n📞 Professional Support\n\nHow can I help you today?`;
}

// ============================================================================
// FACEBOOK API HELPERS
// ============================================================================

/**
 * Send a message to a user
 */
async function sendMessage(recipientId, messageText) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  
  const body = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }

  return await response.json();
}

/**
 * Post a comment reply
 */
async function postComment(commentId, messageText) {
  const url = `https://graph.facebook.com/v18.0/${commentId}/comments?access_token=${PAGE_ACCESS_TOKEN}`;
  
  const body = {
    message: messageText
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post comment: ${error}`);
  }

  return await response.json();
}

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 MAAD Facebook Messenger Webhook Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Verify token: ${VERIFY_TOKEN}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Ready to receive Facebook events! 🎉');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
