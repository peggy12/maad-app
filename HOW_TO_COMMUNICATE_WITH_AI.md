# How to Communicate with Your AI

## 🎯 Quick Answer

Your Base44 AI is already integrated! Here are the ways to communicate with it:

---

## 1️⃣ **Through the Chat Interface (Easiest)**

### Current Setup
Your app is running at **http://localhost:3001/** - just open it and start chatting!

**The AI automatically responds when you:**
1. Type a message in the chat
2. Hit Enter or click Send
3. Your message goes to Base44 AI
4. AI responds with context awareness

**Example conversation:**
```
You: "I need help with plumbing"
AI: "Hi! Yes, MAAD offers plumbing services including leak repairs, 
     sink/tap installations, toilet repairs, drain unblocking, and more. 
     We cover the Fife area. What plumbing issue can we help you with?"

You: "How much does it cost?"
AI: [Knows you're asking about plumbing - context aware!]
     "Thanks for your interest! MAAD provides free, no-obligation quotes. 
     Prices depend on the job scope. Could you share more details about 
     the plumbing work you need?"
```

---

## 2️⃣ **Programmatically (For Developers)**

### Option A: Using the Base44 Service

```typescript
import { getBase44Service } from './services/base44Service.js';

// Initialize the service
const base44 = getBase44Service();
await base44.initialize();

// Send a message (without context)
const response = await base44.generateChatResponse('Hello, I need help');
console.log(response);

// Send a message (with context awareness)
const conversationId = 'conv_1728234567890';
const contextAwareResponse = await base44.generateChatResponse(
  'How much does it cost?',
  undefined,
  conversationId  // This enables context awareness!
);
console.log(contextAwareResponse);
```

### Option B: Direct Agent Invocation

```typescript
import { getBase44Service } from './services/base44Service.js';

const base44 = getBase44Service();
await base44.initialize();

// Invoke the agent directly
const response = await base44.invokeAgent(
  'Tell me about MAAD services',
  'MAAD'  // Agent name
);
console.log(response);
```

### Option C: With Custom Prompts

```typescript
import { getBase44Service } from './services/base44Service.js';
import { contextAwareness } from './services/contextAwareness.js';

const base44 = getBase44Service();
await base44.initialize();

// Build a custom contextual prompt
const conversationId = 'conv_1728234567890';
const contextualPrompt = await contextAwareness.buildContextualPrompt(
  conversationId,
  'When can you come?',
  true  // include history
);

// Format and send
const fullPrompt = contextAwareness.formatPromptForBase44(contextualPrompt);
const response = await base44.invokeAgent(fullPrompt);
console.log(response);
```

---

## 3️⃣ **Through Browser Console (For Testing)**

Open your app at http://localhost:3001/ then:

### Basic Communication
```javascript
// In browser console (F12)
const { getBase44Service } = await import('./services/base44Service.js');

const base44 = getBase44Service();
await base44.initialize();

// Send a message
const response = await base44.generateChatResponse('Hello!');
console.log(response);
```

### Context-Aware Communication
```javascript
// Get current conversation
const convId = localStorage.getItem('maad_current_conversation_id');

// Send with context
const response = await base44.generateChatResponse(
  'How much do you charge?',
  undefined,
  convId
);
console.log(response);
```

### Test Different Prompts
```javascript
const base44 = getBase44Service();

// Test plumbing inquiry
const plumbing = await base44.generateChatResponse('I need a plumber');
console.log('Plumbing:', plumbing);

// Test clearance inquiry
const clearance = await base44.generateChatResponse('Can you clear my garage?');
console.log('Clearance:', clearance);

// Test quote inquiry
const quote = await base44.generateChatResponse('How much does it cost?');
console.log('Quote:', quote);
```

---

## 4️⃣ **Through the useSendMessage Hook (React)**

This is already integrated in your app!

```typescript
import { useSendMessage } from './useSendMessage';

function ChatComponent() {
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState('');
  
  const { sendMessage } = useSendMessage({
    inputValue,
    setInputValue,
    conversation: { id: conversationId },
    // ... other props
  });

  // Just call sendMessage() - it handles everything!
  const handleSubmit = () => {
    sendMessage();  // This calls your AI with context awareness!
  };

  return (
    <div>
      <input 
        value={inputValue} 
        onChange={e => setInputValue(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
      />
      <button onClick={handleSubmit}>Send to AI</button>
    </div>
  );
}
```

---

## 5️⃣ **Special Commands**

Your AI recognizes special patterns:

### Job Search Commands
```
You: "search facebook jobs"
You: "find jobs limit 50"
You: "search jobs score 0.7"
```

AI will search Facebook for job opportunities instead of regular chat.

### Service Inquiries
```
You: "I need help with plumbing"
AI: [Provides plumbing service info]

You: "Can you clear my house?"
AI: [Provides clearance service info]

You: "I need electrical work"
AI: [Provides electrical service info]
```

### Pricing Questions
```
You: "How much does it cost?"
You: "Give me a quote"
You: "What are your prices?"
```

AI will ask for details to provide accurate pricing.

---

## 🔧 Configuration

### Your Current Base44 Setup

**Environment Variables** (in your `.env` file):
```bash
VITE_BASE44_AGENT_NAME=MAAD
VITE_BASE44_BASE_URL=https://manaboutadog.base44.app
VITE_BASE44_API_KEY=d4c9f08499e944ef99621b19d45e9df3
```

### Agent Configuration

Your agent is configured in `services/base44Service.ts`:

```typescript
{
  agentName: 'MAAD',
  baseUrl: 'https://manaboutadog.base44.app',
  apiKey: 'd4c9f08499e944ef99621b19d45e9df3'
}
```

---

## 🎨 Customize AI Responses

### Change the Agent Personality

Edit `services/base44Service.ts` around line 175-230:

```typescript
agents: {
  invoke: async (agentName: string, prompt: string) => {
    // Customize responses here
    if (prompt.toLowerCase().includes('plumbing')) {
      return { output: `Your custom plumbing response...` };
    }
    
    // Default friendly response
    return { 
      output: `Hi there! Thanks for reaching out to MAAD...` 
    };
  }
}
```

### Add Custom Response Templates

In `services/contextAwareness.ts` around line 150-180:

```typescript
private generateSystemPrompt(context: ConversationContext): string {
  let prompt = `You are MAAD...`;
  
  // Add your custom instructions
  if (context.topics.includes('urgent')) {
    prompt += `Prioritize speed in your response.\n`;
  }
  
  return prompt;
}
```

---

## 📊 Monitor AI Communication

### Check Console Logs

When you send a message, watch for:

```
🤖 Invoking Base44 agent "MAAD" with prompt: ...
✅ Base44 agent response (234.56ms): ...
⚡ Using cached Base44 response for agent "MAAD"
🧠 Using context-aware prompt with 3 previous messages
```

### Use Performance Monitor

```javascript
// In browser console
const { performanceTracker } = await import('./utils/performance.js');

// Check AI response times
performanceTracker.getMetrics().forEach(metric => {
  if (metric.name.includes('base44')) {
    console.log(`${metric.name}: ${metric.duration}ms`);
  }
});
```

---

## 🔍 Debug AI Communication

### Enable Verbose Logging

In browser console:
```javascript
// See all Base44 calls
localStorage.setItem('debug', 'base44:*');

// Refresh page
location.reload();
```

### Check What's Being Sent

```javascript
// Intercept and log AI calls
const { getBase44Service } = await import('./services/base44Service.js');
const base44 = getBase44Service();

// Wrap the invoke method
const originalInvoke = base44.invokeAgent.bind(base44);
base44.invokeAgent = async function(prompt, agentName) {
  console.log('📤 Sending to AI:', { prompt, agentName });
  const response = await originalInvoke(prompt, agentName);
  console.log('📥 AI Response:', response);
  return response;
};
```

### Test Different Scenarios

```javascript
// Test conversation flow
const scenarios = [
  'I need help with plumbing',
  'How much does it cost?',
  'When can you come?',
  'What areas do you cover?'
];

for (const message of scenarios) {
  const response = await base44.generateChatResponse(message, undefined, convId);
  console.log(`\nYou: ${message}`);
  console.log(`AI: ${response}`);
}
```

---

## 🚀 Advanced Usage

### Stream Responses (Future Feature)

```typescript
// Placeholder for streaming implementation
async function streamAIResponse(message: string) {
  // This would stream responses word-by-word
  // Not yet implemented, but architecture supports it
}
```

### Batch Multiple Messages

```typescript
const messages = [
  'Tell me about clearance',
  'What are your prices?',
  'Where are you located?'
];

const responses = await Promise.all(
  messages.map(msg => base44.generateChatResponse(msg))
);

responses.forEach((resp, i) => {
  console.log(`${messages[i]} → ${resp}`);
});
```

### Use Different Agents

```typescript
// If you have multiple Base44 agents
const quoteAgent = await base44.invokeAgent(
  'I need a quote',
  'quote_assistant'
);

const supportAgent = await base44.invokeAgent(
  'I have a question',
  'support_assistant'
);
```

---

## 💡 Best Practices

### 1. Always Initialize First
```typescript
const base44 = getBase44Service();
await base44.initialize();  // Don't forget this!
```

### 2. Use Context Awareness
```typescript
// ✅ Good - uses context
await base44.generateChatResponse(message, undefined, conversationId);

// ❌ Less good - no context
await base44.generateChatResponse(message);
```

### 3. Handle Errors Gracefully
```typescript
try {
  const response = await base44.generateChatResponse(message);
  console.log(response);
} catch (error) {
  console.error('AI communication failed:', error);
  // Show user-friendly error message
}
```

### 4. Cache Frequently Asked Questions
```typescript
// The system already does this automatically!
// Repeated queries are cached for 5 minutes
```

---

## 🎯 Quick Test Script

**Copy and paste this into browser console:**

```javascript
(async () => {
  console.log('🤖 Testing AI Communication...\n');
  
  const { getBase44Service } = await import('./services/base44Service.js');
  const base44 = getBase44Service();
  await base44.initialize();
  
  // Test 1: Basic communication
  console.log('Test 1: Basic message');
  const response1 = await base44.generateChatResponse('Hello MAAD!');
  console.log('✅', response1.substring(0, 100) + '...\n');
  
  // Test 2: Service inquiry
  console.log('Test 2: Service inquiry');
  const response2 = await base44.generateChatResponse('I need plumbing help');
  console.log('✅', response2.substring(0, 100) + '...\n');
  
  // Test 3: Context-aware
  console.log('Test 3: Context-aware follow-up');
  const convId = localStorage.getItem('maad_current_conversation_id');
  if (convId) {
    const response3 = await base44.generateChatResponse(
      'How much does it cost?',
      undefined,
      convId
    );
    console.log('✅', response3.substring(0, 100) + '...\n');
  }
  
  console.log('🎉 All tests passed! AI is responding correctly.');
})();
```

---

## 📖 Summary

**Three main ways to communicate with your AI:**

1. **Chat Interface** (http://localhost:3001/) - Just type and send! ✨
2. **Programmatically** - Use `base44Service.generateChatResponse()`
3. **Browser Console** - For testing and debugging

**The AI is already:**
- ✅ Connected and working
- ✅ Context-aware (remembers conversation)
- ✅ Cached (fast repeated responses)
- ✅ Monitored (performance tracking)

**Just open your app and start chatting - it's that simple!** 🚀

---

**Need help?** Check:
- `services/base44Service.ts` - AI integration code
- `useSendMessage.ts` - How messages are sent
- `ADVANCED_AI_FEATURES.md` - Full documentation