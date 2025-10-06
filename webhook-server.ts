/**
 * Facebook Messenger Webhook Server
 * Handles incoming messages and posts from Facebook
 */

import express from 'express';
import { createBase44Service } from './services/base44Service.js';
import { conversationMemory } from './services/conversationMemory.js';
import type { Request, Response } from 'express';

const app = express();
const PORT = 3003; // Use port 3003 (3001 is Vite, 3000/3002 are in use)

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'maad_verify_2025';
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || 'EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD';
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || '820172544505737';

// Initialize Base44 service
const base44 = createBase44Service({
  agentName: 'MAAD',
  baseUrl: 'https://manaboutadog.base44.app',
  apiKey: process.env.BASE44_API_KEY || 'd4c9f08499e944ef99621b19d45e9df3',
  facebookPageId: PAGE_ID,
  facebookAccessToken: PAGE_ACCESS_TOKEN
});

// Initialize Base44 on startup
base44.initialize().then(() => {
  console.log('✅ Base44 service initialized');
}).catch((error) => {
  console.error('❌ Base44 initialization failed:', error);
});

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'facebook-webhook',
    port: PORT
  });
});

/**
 * Webhook verification (GET /webhook)
 * Facebook will call this to verify your endpoint
 */
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

/**
 * Webhook event handler (POST /webhook)
 * Facebook will POST here when events occur
 */
app.post('/webhook', async (req: Request, res: Response) => {
  const body = req.body;

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
            await handleMessagingEvent(event);
          }
        }

        // Process feed changes (posts/comments)
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            await handleFeedChange(change);
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
async function handleMessagingEvent(event: any) {
  const senderId = event.sender?.id;
  const recipientId = event.recipient?.id;
  const timestamp = event.timestamp;
  const message = event.message;

  console.log('📨 Received message event:', { senderId, timestamp, message: message?.text });

  // Ignore messages sent by the page
  if (!message || !senderId) {
    return;
  }

  try {
    const messageText = message.text || '';
    
    // Add to conversation memory
    const conversationId = `messenger_${senderId}`;
    
    await conversationMemory.addMessage(
      conversationId,
      'user',
      messageText
    );

    // Get AI response
    const response = await base44.generateChatResponse(
      messageText,
      undefined,
      conversationId
    );

    // Add AI response to memory
    await conversationMemory.addMessage(
      conversationId,
      'assistant',
      response
    );

    // Send response back to user
    await sendMessage(senderId, response);
    
    console.log('✅ Sent reply to user:', senderId);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    await sendMessage(senderId, "Sorry, I encountered an error. Please try again.");
  }
}

/**
 * Handle feed changes (posts/comments)
 */
async function handleFeedChange(change: any) {
  const field = change.field;
  const value = change.value;

  console.log('📝 Feed change:', { field, value });

  // Handle post comments
  if (field === 'feed' && value.item === 'comment') {
    const commentId = value.comment_id;
    const postId = value.post_id;
    const senderId = value.from?.id;
    const message = value.message;

    console.log('💬 New comment:', { postId, commentId, senderId, message });

    try {
      // Get AI response
      const conversationId = `post_${postId}_user_${senderId}`;
      
      await conversationMemory.addMessage(
        conversationId,
        'user',
        message
      );

      const response = await base44.generateChatResponse(
        message,
        undefined,
        conversationId
      );

      // Post reply to comment
      await postComment(commentId, response);
      
      console.log('✅ Replied to comment:', commentId);
    } catch (error) {
      console.error('❌ Error handling comment:', error);
    }
  }
}

// ============================================================================
// FACEBOOK API HELPERS
// ============================================================================

/**
 * Send a message to a user
 */
async function sendMessage(recipientId: string, messageText: string): Promise<void> {
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
}

/**
 * Post a comment reply
 */
async function postComment(commentId: string, messageText: string): Promise<void> {
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
}

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Facebook Messenger Webhook Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Server listening on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log(`Verify token: ${VERIFY_TOKEN}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Ready to receive Facebook events! 🎉');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
