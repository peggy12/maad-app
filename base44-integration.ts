/**
 * Complete Base44 + Facebook Integration Script for MAAD
 * 
 * This script demonstrates how to use Base44 with your specific credentials:
 * - Page ID: 820172544505737
 * - Access Token: EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
 */

// For Deno/Server-side usage
// Type declarations for Deno environment
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
};

interface GlobalWithDeno {
  Deno?: typeof Deno;
}

const globalWithDeno = globalThis as GlobalWithDeno;

// Import Base44 SDK - adjust import path as needed for your environment
// For Deno: import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
// For Node.js: import { createClientFromRequest } from '@base44/sdk';
const createClientFromRequest = (globalThis as any).createClientFromRequest || 
  ((req: Request) => Promise.resolve({
    asServiceRole: {
      entities: {},
      integrations: {},
      functions: {
        invoke: async (name: string, data: any) => ({ output: 'Mock response' })
      }
    }
  }));
import { isPotentialJob } from './matchJobKeywords.js';
import { generateReply } from './generateReply.js';
import { postFacebookComment } from './postFacebookComment.js';

// Your specific credentials
const PAGE_ID = "820172544505737";
const ACCESS_TOKEN = "EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD";
const AGENT_NAME = "quote_assistant";

// Initialize Base44 client
let base44Client: any = null;

async function initializeBase44(request: Request) {
  try {
    base44Client = await createClientFromRequest(request);
    console.log('✅ Base44 SDK initialized with your credentials - base44-integration.ts:49');
    return base44Client;
  } catch (error) {
    console.error('❌ Failed to initialize Base44: - base44-integration.ts:52', error);
    throw error;
  }
}

// Main integration functions
export async function processJobInquiry(userMessage: string, request?: Request): Promise<string> {
  if (!base44Client && request) {
    await initializeBase44(request);
  }
  
  if (!base44Client) {
    throw new Error('Base44 client not initialized');
  }

  const prompt = `You're replying on behalf of MAAD, a local clearance and handyman service in Fife. 
  
Customer inquiry: "${userMessage}"

Generate a helpful, professional response. Include:
- Friendly greeting
- Acknowledge their specific need
- Mention relevant MAAD services
- Invite them to provide more details or call
- Keep it conversational and helpful

Example services: house clearance, garden clearance, handyman work, electrical, plumbing, junk removal, furniture disposal.`;

  try {
    const response = await base44Client.asServiceRole.agents.invoke(AGENT_NAME, prompt);
    return response.output;
  } catch (error) {
    console.error('❌ Base44 agent error: - base44-integration.ts:84', error);
    return "Hi! Thanks for contacting MAAD. We'd be happy to help with your request. Please call us or send more details about what you need.";
  }
}

export async function analyzeFacebookPost(postContent: string, request?: Request): Promise<{ shouldReply: boolean; reply: string }> {
  if (!base44Client && request) {
    await initializeBase44(request);
  }
  
  // Check with keyword matching first
  if (!isPotentialJob(postContent)) {
    return { shouldReply: false, reply: 'IGNORE' };
  }

  const prompt = `Analyze this Facebook post to determine if it's a legitimate job opportunity for MAAD (handyman/clearance service in Fife, Scotland).

Post: "${postContent}"

Instructions:
1. If it's a genuine job request, generate a professional reply
2. If it's spam, personal post, or unrelated, respond with "IGNORE"
3. Look for: clearance, handyman, electrician, plumber, garden work, waste removal, furniture disposal
4. Consider Fife locations: Kennoway, Kirkcaldy, Glenrothes, etc.
5. Keep replies friendly, brief, and professional

Reply format if it's a job:
"Hi! MAAD here - we specialize in [relevant service]. We cover the Fife area and would be happy to help. Please send us more details or give us a call for a free quote!"`;

  try {
    if (!base44Client) {
      // Fallback without Base44
      return { shouldReply: true, reply: "Hi! MAAD here - we'd be happy to help with your request. Please give us a call or send more details!" };
    }

    const response = await base44Client.asServiceRole.agents.invoke(AGENT_NAME, prompt);
    
    return {
      shouldReply: response.output !== 'IGNORE' && !response.output.includes('IGNORE'),
      reply: response.output
    };
  } catch (error) {
    console.error('❌ Base44 analysis error: - base44-integration.ts:126', error);
    return { shouldReply: false, reply: 'IGNORE' };
  }
}

// Facebook webhook handler with your credentials
export async function handleFacebookWebhook(body: any, request?: Request): Promise<void> {
  if (body.object !== "page") return;

  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field === "feed" && change.value) {
        const post = change.value;
        
        if (post.message) {
          console.log(`📝 New Facebook post: ${post.message.substring(0, 100)}... - base44-integration.ts:141`);
          
          // Analyze with Base44
          const analysis = await analyzeFacebookPost(post.message, request);
          
          if (analysis.shouldReply && analysis.reply !== 'IGNORE') {
            try {
              // Post the reply using your access token
              const commentId = await postFacebookComment(
                post.post_id || post.id, 
                analysis.reply, 
                ACCESS_TOKEN
              );
              
              if (commentId) {
                console.log(`✅ Posted Base44 reply to Facebook post ${post.id} - base44-integration.ts:156`);
              }
            } catch (error) {
              console.error(`❌ Failed to post reply: - base44-integration.ts:159`, error);
            }
          } else {
            console.log(`🚫 Ignoring post (not a job opportunity) - base44-integration.ts:162`);
          }
        }
      }
    }
  }
}

// Deno server setup
if (typeof globalWithDeno.Deno !== 'undefined') {
  globalWithDeno.Deno!.serve(async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const body = await request.json();
        await handleFacebookWebhook(body, request);
        return new Response('EVENT_RECEIVED', { status: 200 });
      } catch (error) {
        console.error('Webhook error: - base44-integration.ts:181', error);
        return new Response('Error processing webhook', { status: 500 });
      }
    }
    
    if (url.pathname === '/webhook' && request.method === 'GET') {
      // Webhook verification
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      if (mode === 'subscribe' && token === 'maadlad_verify_token') {
        return new Response(challenge, { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }
    
    if (url.pathname === '/test' && request.method === 'POST') {
      // Test endpoint for Base44 integration
      try {
        const { message } = await request.json();
        const response = await processJobInquiry(message, request);
        return new Response(JSON.stringify({ reply: response }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('MAAD Base44 Integration Server', { status: 200 });
  });
  
  console.log(`🚀 MAAD Server running with Base44 integration - base44-integration.ts:217`);
  console.log(`📱 Facebook Page ID: ${PAGE_ID} - base44-integration.ts:218`);
  console.log(`🤖 Base44 Agent: ${AGENT_NAME} - base44-integration.ts:219`);
  console.log(`🔗 Webhook: http://localhost:8000/webhook - base44-integration.ts:220`);
  console.log(`🧪 Test: POST http://localhost:8000/test with {"message": "I need help"} - base44-integration.ts:221`);
}

// Usage examples:
/*
// Test the integration:
curl -X POST http://localhost:8000/test \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help clearing my garage"}'

// Expected response:
{
  "reply": "Hi! Thanks for contacting MAAD. We specialize in clearance services and would be happy to help clear your garage. We cover the Fife area. Please give us a call or send more details for a free quote!"
}
*/