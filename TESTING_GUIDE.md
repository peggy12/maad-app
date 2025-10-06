# Testing Guide - Advanced AI Features

## 🚀 Quick Start Testing (5 Minutes)

### Option 1: Browser Console Testing (Fastest)

1. **Start your development server**
   ```powershell
   npm run dev
   ```

2. **Open the app in your browser** (usually http://localhost:5173)

3. **Open browser console** (F12 or Right-click → Inspect → Console)

4. **Run these test commands:**

   ```javascript
   // Import the test functions
   const { testConversationMemory, testContextAwareness } = await import('./examples/context-aware-chat.tsx');
   
   // Test conversation memory (creates, saves, searches conversations)
   await testConversationMemory();
   
   // Test context awareness (topic detection, intent, sentiment)
   await testContextAwareness();
   ```

5. **Check the console output** - You should see:
   - ✅ Conversation created
   - ✅ Messages added
   - ✅ Context retrieved
   - ✅ Topics detected
   - ✅ Intent recognized
   - ✅ Sentiment analyzed

### Option 2: Test in the Chat Interface (Recommended)

1. **Start the dev server**
   ```powershell
   npm run dev
   ```

2. **Open the app** in your browser

3. **Have a conversation** - Try these test scenarios:

#### Test Scenario 1: Topic Detection
```
You: "I need help with plumbing"
AI: [Responds about plumbing services]

You: "How much does it cost?"
AI: [Should reference plumbing - context aware!]

You: "When can you come?"
AI: [Should know it's about plumbing booking]
```

#### Test Scenario 2: Intent Recognition
```
You: "Can you clear my house?"
AI: [Detects clearance request]

You: "Give me a quote"
AI: [Detects quote request, asks for details]
```

#### Test Scenario 3: Context Persistence
```
You: Send a message
Refresh the page (F5)
Check: Your messages should still be there!
```

4. **Open DevTools Console** (F12) to see:
   - `🧠 Using context-aware prompt with X previous messages`
   - `📖 Loaded existing conversation: conv_...`
   - Context retrieval times (<50ms)

### Option 3: Interactive Testing Component

1. **Add the test component to your App**

   Open `App.tsx` or `App-Modern.tsx` and temporarily add:
   
   ```tsx
   import ChatWithContextExample from './examples/context-aware-chat';
   
   // Replace your current render with:
   return <ChatWithContextExample />;
   ```

2. **Start the dev server**
   ```powershell
   npm run dev
   ```

3. **You'll see:**
   - Conversation history sidebar (left)
   - Chat interface (center)
   - "View Insights" button (top)

4. **Test features:**
   - Send messages and see context awareness
   - Click "View Insights" to see conversation analytics
   - Search for conversations in the sidebar
   - Click conversations to switch between them

## 🧪 Detailed Feature Testing

### Test 1: Conversation Memory Persistence

**Goal**: Verify conversations persist across page reloads

1. Send 3-5 messages in the chat
2. Note the conversation ID in console (e.g., `conv_1728234567890`)
3. Refresh the page (F5)
4. Messages should still be visible
5. Send another message - context should still work

**Check Console For:**
```
📖 Loaded existing conversation: conv_1728234567890
✅ Conversation saved: conv_1728234567890
```

**Verify in Browser DevTools:**
- Application tab → IndexedDB → maad_conversations
- Should see your conversation stored

---

### Test 2: Context Awareness

**Goal**: Verify AI uses conversation history

**Test Script:**
```javascript
// In browser console
const { conversationMemory } = await import('./services/conversationMemory.js');
const { contextAwareness } = await import('./services/contextAwareness.js');

// Get current conversation
const convId = localStorage.getItem('maad_current_conversation_id');
const conv = await conversationMemory.getConversation(convId);

console.log('Current conversation:', conv.title);
console.log('Messages:', conv.messages.length);

// Analyze context
const context = await contextAwareness.analyzeContext(
  convId, 
  'How much will this cost?'
);

console.log('Detected topics:', context.topics);
console.log('User intent:', context.userIntent);
console.log('Sentiment:', context.sentiment);
```

**Expected Output:**
```
Detected topics: ['quote', 'handyman'] // or whatever you discussed
User intent: 'question'
Sentiment: 'neutral'
```

---

### Test 3: Topic Detection

**Goal**: Verify system identifies conversation topics

**Test Conversations:**

| Your Message | Expected Topic | How to Verify |
|--------------|----------------|---------------|
| "I need a plumber" | handyman | Check console logs |
| "Can you clear my garage?" | clearance | Check conversation tags |
| "How much do you charge?" | quote | Check intent detection |
| "When are you available?" | booking | Check suggested responses |
| "Search for jobs" | jobs | Check topic extraction |

**Verification:**
```javascript
// In browser console
const { contextAwareness } = await import('./services/contextAwareness.js');
const convId = localStorage.getItem('maad_current_conversation_id');

const insights = await contextAwareness.getInsights(convId);
console.log('Topics discussed:', insights.topics);
```

---

### Test 4: Search Functionality

**Goal**: Verify full-text search works

1. Create multiple conversations with different topics
2. Open browser console:

```javascript
const { conversationMemory } = await import('./services/conversationMemory.js');

// Search for specific keywords
const plumbingConvs = await conversationMemory.searchConversations('plumbing');
console.log('Found', plumbingConvs.length, 'plumbing conversations');

const quoteConvs = await conversationMemory.searchConversations('quote');
console.log('Found', quoteConvs.length, 'quote conversations');
```

---

### Test 5: Conversation History UI

**Goal**: Test the ConversationHistory component

1. **Add to your app** (if not already):
   ```tsx
   import ConversationHistory from './components/ConversationHistory';
   
   <ConversationHistory
     currentConversationId={conversationId}
     onSelectConversation={handleSelectConversation}
   />
   ```

2. **Test actions:**
   - ✅ Click conversation to switch
   - ✅ Use search bar to find conversations
   - ✅ Click insights icon to view analytics
   - ✅ Click export icon to download JSON
   - ✅ Click delete icon to remove conversation

3. **Verify UI updates:**
   - Active conversation should be highlighted
   - Message counts should be accurate
   - Topics should show as tags
   - Dates should be formatted correctly

---

### Test 6: Conversation Insights

**Goal**: Verify analytics are accurate

```javascript
// In browser console
const { contextAwareness } = await import('./services/contextAwareness.js');
const convId = localStorage.getItem('maad_current_conversation_id');

const insights = await contextAwareness.getInsights(convId);

console.log('=== Conversation Insights ===');
console.log('Topics:', insights.topics);
console.log('Messages:', insights.messageCount);
console.log('Duration:', Math.round(insights.duration / 60000), 'minutes');
console.log('Avg Response:', insights.averageResponseLength, 'characters');
console.log('Sentiment:', insights.sentiment);
```

---

### Test 7: Export/Import

**Goal**: Test data portability

**Export:**
```javascript
const { conversationMemory } = await import('./services/conversationMemory.js');
const convId = localStorage.getItem('maad_current_conversation_id');
const conv = await conversationMemory.getConversation(convId);

// Export to JSON
const exportData = JSON.stringify(conv, null, 2);
console.log(exportData);

// Or use the UI export button in ConversationHistory component
```

**Import:**
```javascript
// Paste exported JSON
const importedConv = {
  /* your exported conversation data */
};

await conversationMemory.saveConversation(importedConv);
console.log('Imported conversation:', importedConv.id);
```

---

### Test 8: Performance

**Goal**: Verify system is fast

**Monitor These Metrics:**

1. **Context Retrieval** (should be <50ms):
   ```javascript
   console.time('context');
   const context = await conversationMemory.getConversationContext(convId, 10);
   console.timeEnd('context');
   ```

2. **Cache Hit Rate** (check console logs):
   ```
   ⚡ Using cached Base44 response for agent "MAAD"
   ```

3. **Memory Usage** (in DevTools Performance Monitor):
   - Open DevTools → Performance Monitor
   - Should stay under 100MB for typical usage

---

### Test 9: Offline Mode

**Goal**: Verify localStorage fallback works

1. **Disable IndexedDB** in Chrome DevTools:
   - F12 → Application → IndexedDB
   - Right-click → Delete database
   - Or use private browsing mode

2. **Test the chat** - Should still work with localStorage

3. **Check console**:
   ```
   ⚠️ IndexedDB not available, using localStorage fallback
   ```

---

### Test 10: Error Handling

**Goal**: Verify graceful degradation

**Test Scenarios:**

1. **Network Error:**
   - Disconnect internet
   - Send message
   - Should show error toast
   - Should not break UI

2. **Invalid Conversation ID:**
   ```javascript
   const conv = await conversationMemory.getConversation('invalid_id');
   console.log(conv); // Should be null, not crash
   ```

3. **Empty Context:**
   - Start fresh conversation
   - First message should work without context

---

## 📊 Success Checklist

### Core Functionality
- [ ] Conversations persist across page reloads
- [ ] Messages save to IndexedDB successfully
- [ ] Context awareness works (AI references previous messages)
- [ ] Search finds relevant conversations
- [ ] Topic detection identifies correct categories
- [ ] Intent recognition works for different message types
- [ ] Sentiment analysis detects positive/negative/neutral

### Performance
- [ ] Context retrieval is fast (<50ms)
- [ ] Cached responses are faster (~800ms)
- [ ] No memory leaks (check Performance Monitor)
- [ ] UI remains responsive with many conversations

### UI/UX
- [ ] Conversation list displays correctly
- [ ] Search works in real-time
- [ ] Insights modal shows accurate data
- [ ] Export downloads valid JSON
- [ ] Delete removes conversation
- [ ] Active conversation is highlighted
- [ ] Animations are smooth (Framer Motion)

### Edge Cases
- [ ] Works with IndexedDB disabled (localStorage fallback)
- [ ] Handles empty conversations gracefully
- [ ] Handles very long conversations (100+ messages)
- [ ] Works offline (service worker caching)
- [ ] Handles network errors gracefully

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** 
```powershell
npm install
npm run dev
```

### Issue: Conversations not persisting
**Solution:**
1. Check browser console for errors
2. Verify IndexedDB in DevTools (Application tab)
3. Check localStorage has `maad_current_conversation_id`

### Issue: Context not working
**Solution:**
1. Verify `conversationId` is being passed
2. Check console for context-related logs
3. Ensure conversation has messages

### Issue: UI not updating
**Solution:**
1. Hard refresh (Ctrl+F5)
2. Clear browser cache
3. Check React DevTools for component state

---

## 🎯 Quick Test Commands

**Run all tests at once:**
```javascript
// In browser console
async function runAllTests() {
  const { testConversationMemory, testContextAwareness } = 
    await import('./examples/context-aware-chat.tsx');
  
  console.log('🧪 Testing Conversation Memory...');
  await testConversationMemory();
  
  console.log('\n🧪 Testing Context Awareness...');
  await testContextAwareness();
  
  console.log('\n✅ All tests complete!');
}

runAllTests();
```

**Check current state:**
```javascript
// Quick diagnostics
const { conversationMemory } = await import('./services/conversationMemory.js');

const stats = await conversationMemory.getStats();
console.log('📊 Stats:', stats);

const convId = localStorage.getItem('maad_current_conversation_id');
console.log('💬 Current conversation:', convId);

const conv = await conversationMemory.getConversation(convId);
console.log('📝 Messages:', conv?.messages.length);
```

---

## 📸 Expected Results

### Console Output (Good)
```
✨ Created new conversation: conv_1728234567890
🧠 Using context-aware prompt with 3 previous messages
⚡ Using cached Base44 response for agent "MAAD"
✅ Conversation saved: conv_1728234567890
📖 Loaded existing conversation: conv_1728234567890
```

### Console Output (Bad)
```
❌ Failed to save conversation: [error]
⚠️ Context awareness failed, falling back to basic prompt
❌ IndexedDB error: QuotaExceededError
```

---

## 🎓 What to Look For

### Good Signs ✅
- Console shows context retrieval (<50ms)
- Messages persist after page reload
- AI responses reference previous messages
- Search finds correct conversations
- Topics automatically detected
- Cache hits for repeated queries

### Bad Signs ❌
- Errors in console
- Messages disappear after reload
- AI responses ignore context
- Search returns no results
- Performance is slow (>200ms for context)
- Memory usage grows continuously

---

## 💡 Pro Tips

1. **Use Chrome DevTools** - Best for debugging IndexedDB
2. **Check Console Logs** - Lots of helpful diagnostic info
3. **Test with Real Conversations** - Multi-turn dialogs show context best
4. **Monitor Performance** - Use Performance Monitor tab
5. **Test Edge Cases** - Empty convos, long convos, offline mode

---

**Ready to test? Start with Option 2 (Chat Interface) for the best experience!** 🚀