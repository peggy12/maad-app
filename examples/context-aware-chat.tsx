/**
 * MAAD App - Quick Start with Advanced AI
 * 
 * This example shows how to use the new context-aware features
 */

import React, { useState, useEffect } from 'react';
import { conversationMemory } from '../services/conversationMemory.js';
import { contextAwareness } from '../services/contextAwareness.js';
import { getBase44Service } from '../services/base44Service.js';
import ConversationHistory from '../components/ConversationHistory.js';

export function ChatWithContextExample() {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation();
  }, []);

  // Load conversation messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const initializeConversation = async () => {
    // Check for existing conversation
    const savedId = localStorage.getItem('maad_current_conversation_id');
    
    if (savedId) {
      const existing = await conversationMemory.getConversation(savedId);
      if (existing) {
        setConversationId(savedId);
        return;
      }
    }
    
    // Create new conversation
    const newId = `conv_${Date.now()}`;
    await conversationMemory.saveConversation({
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    setConversationId(newId);
    localStorage.setItem('maad_current_conversation_id', newId);
  };

  const loadMessages = async () => {
    const conversation = await conversationMemory.getConversation(conversationId);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    try {
      // Save user message
      await conversationMemory.addMessage(conversationId, 'user', userMessage);
      
      // Update UI immediately
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      }]);

      // Get context-aware AI response
      const base44 = getBase44Service();
      const response = await base44.generateChatResponse(
        userMessage,
        undefined,
        conversationId // This enables context awareness!
      );

      // Save AI response
      await conversationMemory.addMessage(conversationId, 'assistant', response);
      
      // Update UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }]);

    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setConversationId(id);
    localStorage.setItem('maad_current_conversation_id', id);
  };

  const getConversationInsights = async () => {
    if (!conversationId) return;
    
    const insights = await contextAwareness.getInsights(conversationId);
    
    console.log('Conversation Insights:', {
      topics: insights.topics,
      messageCount: insights.messageCount,
      duration: `${Math.round(insights.duration / 60000)} minutes`,
      avgResponse: `${insights.averageResponseLength} characters`,
      sentiment: insights.sentiment
    });
    
    alert(`Topics: ${insights.topics.join(', ')}\nSentiment: ${insights.sentiment}`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Conversation History Sidebar */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', overflow: 'auto' }}>
        <ConversationHistory
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
          <h2>MAAD Chat (Context-Aware)</h2>
          <button onClick={getConversationInsights}>
            View Insights
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                background: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '8px',
                maxWidth: '70%',
                marginLeft: msg.role === 'user' ? 'auto' : '0'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {msg.role === 'user' ? 'You' : 'MAAD'}
              </div>
              <div>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ padding: '1rem', color: '#666' }}>
              MAAD is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '1rem', borderTop: '1px solid #ccc', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Example: Test context awareness
export async function testContextAwareness() {
  console.log('=== Testing Context Awareness ===\n');

  // Create test conversation
  const testId = `test_${Date.now()}`;
  await conversationMemory.saveConversation({
    id: testId,
    title: 'Test Conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  // Add test messages
  await conversationMemory.addMessage(testId, 'user', 'I need help with plumbing');
  await conversationMemory.addMessage(testId, 'assistant', 'I can help with plumbing services...');
  await conversationMemory.addMessage(testId, 'user', 'How much does it cost?');

  // Analyze context
  const context = await contextAwareness.analyzeContext(testId, 'When can you come?');
  
  console.log('Topics detected:', context.topics);
  console.log('User intent:', context.userIntent);
  console.log('Sentiment:', context.sentiment);
  console.log('Suggested responses:', context.suggestedResponses);
  
  // Build contextual prompt
  const prompt = await contextAwareness.buildContextualPrompt(testId, 'When can you come?');
  
  console.log('\nContextual Prompt:');
  console.log('Has history:', prompt.metadata.hasHistory);
  console.log('Message count:', prompt.metadata.messageCount);
  console.log('Topics:', prompt.metadata.topics);
  
  // Get insights
  const insights = await contextAwareness.getInsights(testId);
  
  console.log('\nInsights:');
  console.log('Topics:', insights.topics);
  console.log('Message count:', insights.messageCount);
  console.log('Sentiment:', insights.sentiment);
  
  // Cleanup
  await conversationMemory.deleteConversation(testId);
  
  console.log('\n✅ Context awareness test complete!');
}

// Example: Test conversation memory
export async function testConversationMemory() {
  console.log('=== Testing Conversation Memory ===\n');

  // Create conversation
  const id = `test_${Date.now()}`;
  await conversationMemory.saveConversation({
    id,
    title: 'Memory Test',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  console.log('✅ Created conversation:', id);

  // Add messages
  await conversationMemory.addMessage(id, 'user', 'Hello');
  await conversationMemory.addMessage(id, 'assistant', 'Hi! How can I help?');
  await conversationMemory.addMessage(id, 'user', 'I need a quote');
  
  console.log('✅ Added 3 messages');

  // Get conversation
  const conv = await conversationMemory.getConversation(id);
  console.log('✅ Retrieved conversation:', conv?.title);
  console.log('   Messages:', conv?.messages.length);

  // Get context
  const context = await conversationMemory.getConversationContext(id, 5);
  console.log('✅ Retrieved context:', context.length, 'messages');

  // Search
  const results = await conversationMemory.searchConversations('quote');
  console.log('✅ Search results:', results.length, 'conversations');

  // Get stats
  const stats = await conversationMemory.getStats();
  console.log('✅ Stats:', stats);

  // Cleanup
  await conversationMemory.deleteConversation(id);
  console.log('✅ Cleaned up test conversation');
  
  console.log('\n✅ Conversation memory test complete!');
}

export default ChatWithContextExample;