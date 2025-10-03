# Base44 Integration Guide for MAAD App

This guide shows how to### **2. Server-Side Integration (main.ts)**
Your `main.ts` file already### **1. Environment Variables** 
Your credentials are already built-in, but for production create `.env` file:
```env
# Facebook Integration (Already configured)
VITE_FACEBOOK_PAGE_ID=820172544505737
VITE_FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD

# Base44 Configuration
VITE_BASE44_AGENT_NAME=quote_assistant

# Server-side (Deno) - Already configured in scripts
FACEBOOK_PAGE_ID=820172544505737
FACEBOOK_ACCESS_TOKEN=EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD
```egration with your credentials:

```typescript
// main.ts - Server-side Base44 usage with your credentials
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Your specific credentials are pre-configured:
const PAGE_ID = "820172544505737";
const ACCESS_TOKEN = "EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD";
const AGENT_NAME = "quote_assistant";

// Initialize with request context
const base44 = await createClientFromRequest(request);

// Use your "quote_assistant" agent
const response = await base44.asServiceRole.agents.invoke(
  "quote_assistant", 
  "Generate response for this customer inquiry..."
);
```pp with Base44 SDK from both the React client side and the server side.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Base44 Agent   │    │  Facebook API   │
│  (Browser)      │    │  "quote_assist"  │    │                 │
│                 │    │                 │    │                 │
│  User types     │───▶│  Generate       │    │  Job Search     │
│  "I need help"  │    │  Response       │    │  Results        │
│                 │    │                 │    │                 │
│  Display AI     │◀───│  Professional   │    │                 │
│  Response       │    │  Reply          │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 How to Use From React App (Browser)

### 1. **Chat Interface Usage**
Your chat interface at `http://localhost:3000` now automatically uses Base44:

```typescript
// User types in chat: "I need someone to clear my garden"
// The app will:
// 1. Send to Base44 agent "quote_assistant" 
// 2. Get professional MAAD response
// 3. Display in chat interface
```

### 2. **Available Commands**
```bash
# Job Search Commands (Facebook integration)
"search facebook jobs"
"find jobs limit 50" 
"search facebook jobs score 0.7"

# Regular Chat (Base44 AI responses)
"I need help with clearance"
"How much for garden clearance?"
"Do you do handyman work?"
```

### 3. **Base44 Service Usage in Code**
```typescript
import { getBase44Service } from './services/base44Service.js';

// Get the service instance
const base44 = getBase44Service();

// Generate professional responses
const response = await base44.generateChatResponse(
  "I need my garage cleared out",
  "Customer from Fife area"
);

// Generate job post replies  
const jobReply = await base44.generateJobReply(
  "Looking for someone to clear house contents"
);
```

## 🖥️ How to Use From Server Side (Deno/Node.js)

### 1. **Server-Side Processing (main.ts)**
Your `main.ts` file already has Base44 integration:

```typescript
// main.ts - Server-side Base44 usage
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Initialize with request context
const base44 = await createClientFromRequest(request);

// Use the agent
const response = await base44.asServiceRole.agents.invoke(
  "quote_assistant", 
  "Generate response for this customer inquiry..."
);
```

### 2. **Facebook Webhook Integration**
```typescript
// In your webhook handler
app.post("/webhook", async (req, res) => {
  const body = req.body;
  
  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field === "feed") {
          const post = change.value;
          
          // Check if it's a potential job
          if (isPotentialJob(post.message)) {
            // Generate Base44 response
            const reply = await base44.asServiceRole.agents.invoke(
              "quote_assistant",
              `Analyze this post: "${post.message}"`
            );
            
            // Post reply if appropriate
            if (reply.output !== "IGNORE") {
              await postFacebookComment(post.id, reply.output, ACCESS_TOKEN);
            }
          }
        }
      }
    }
  }
  
  res.status(200).send("EVENT_RECEIVED");
});
```

## 🔧 Setup Instructions

### 1. **Environment Variables**
Create `.env` file:
```env
# Facebook Integration
VITE_FACEBOOK_PAGE_ID=820172544505737
VITE_FACEBOOK_ACCESS_TOKEN=your_token_here

# Base44 Configuration (if needed for browser)
VITE_BASE44_API_KEY=your_api_key
VITE_BASE44_AGENT_NAME=quote_assistant

# Server-side (Deno)
FACEBOOK_PAGE_ID=820172544505737
FACEBOOK_ACCESS_TOKEN=your_token_here
```

### 2. **Start the Services**

**React Chat Interface:**
```bash
npm run dev
# Opens http://localhost:3000
```

**Webhook Server (for Facebook):**
```bash  
npm run webhook
# Runs on port 1337
```

**Deno Server (if using main.ts):**
```bash
deno run --allow-net --allow-env main.ts
```

## 🎯 Real-World Usage Examples

### **Scenario 1: Customer Chat**
1. Customer visits your website at `localhost:3000`
2. Types: *"Hi, I need help clearing out my loft"*
3. Base44 agent generates: *"Hi there! We'd be happy to help with your loft clearance. MAAD specializes in house clearances across Fife. We can provide a free quote - just let us know the size of your loft and what needs clearing. Call us or send more details!"*

### **Scenario 2: Facebook Job Detection**  
1. Someone posts on Facebook: *"Looking for someone to clear garden waste in Kennoway"*
2. Your webhook detects it as a job opportunity
3. Base44 generates appropriate response
4. Posts professional MAAD reply automatically

### **Scenario 3: Job Search from Chat**
1. You type in chat: *"search facebook jobs limit 30"*
2. System searches your Facebook page for job opportunities
3. Returns list of potential jobs with confidence scores
4. You can then respond to promising leads

## 🔍 Monitoring & Debugging

### **Browser Console**
- Base44 calls are logged with 🤖 emoji
- Facebook API calls logged with 📡 emoji  
- Errors shown with ❌ emoji

### **Server Logs**
```bash
# Check webhook activity
tail -f webhook.log

# Monitor Deno server
deno run --allow-net --allow-env --log-level=info main.ts
```

## 🚨 Production Considerations

1. **Replace Mock Base44 Client**: The browser version uses a mock client. For production, you'll need the actual Base44 browser SDK.

2. **API Rate Limits**: 
   - Facebook: 200 calls/hour per user
   - Base44: Check your plan limits

3. **Security**:
   - Never expose access tokens in client-side code
   - Use environment variables
   - Consider webhook verification tokens

4. **Error Handling**:
   - Graceful fallbacks for API failures
   - User-friendly error messages
   - Retry mechanisms for important operations

## 📞 Integration Support

If you need help with:
- Base44 agent training/configuration
- Facebook API setup
- Production deployment

The Base44 team can assist with agent optimization and custom integrations for your specific MAAD service needs.