/**
 * Context Awareness System for MAAD AI
 * Provides intelligent context management for conversations
 * Analyzes conversation history to provide better AI responses
 */

import { conversationMemory } from './conversationMemory.js';
import type { ConversationMessage, Conversation } from './conversationMemory.js';

export interface ConversationContext {
  recentMessages: ConversationMessage[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  userIntent: string;
  suggestedResponses: string[];
  relatedConversations: string[];
}

export interface ContextualPrompt {
  systemPrompt: string;
  userMessage: string;
  context: string;
  metadata: {
    hasHistory: boolean;
    messageCount: number;
    topics: string[];
  };
}

class ContextAwarenessService {
  private readonly MAX_CONTEXT_MESSAGES = 10;
  private readonly TOPIC_KEYWORDS = {
    jobs: ['job', 'work', 'employment', 'hiring', 'position', 'vacancy', 'career'],
    clearance: ['clearance', 'rubbish', 'junk', 'removal', 'disposal', 'waste'],
    handyman: ['repair', 'fix', 'handyman', 'maintenance', 'plumbing', 'electrical'],
    quote: ['quote', 'price', 'cost', 'estimate', 'how much', 'charge'],
    booking: ['book', 'schedule', 'appointment', 'when', 'available', 'time'],
    support: ['help', 'problem', 'issue', 'question', 'how to', 'what is']
  };

  // Build contextual prompt for Base44
  async buildContextualPrompt(
    conversationId: string,
    userMessage: string,
    includeHistory = true
  ): Promise<ContextualPrompt> {
    const context = await this.analyzeContext(conversationId, userMessage);
    
    const systemPrompt = this.generateSystemPrompt(context);
    const contextSummary = this.generateContextSummary(context);

    return {
      systemPrompt,
      userMessage,
      context: contextSummary,
      metadata: {
        hasHistory: context.recentMessages.length > 0,
        messageCount: context.recentMessages.length,
        topics: context.topics
      }
    };
  }

  // Analyze conversation context
  async analyzeContext(
    conversationId: string,
    currentMessage: string
  ): Promise<ConversationContext> {
    // Get recent messages
    const recentMessages = await conversationMemory.getConversationContext(
      conversationId,
      this.MAX_CONTEXT_MESSAGES
    );

    // Extract topics
    const allText = [
      ...recentMessages.map(m => m.content),
      currentMessage
    ].join(' ');
    const topics = this.extractTopics(allText);

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(currentMessage);

    // Detect user intent
    const userIntent = this.detectIntent(currentMessage, topics);

    // Generate suggested responses
    const suggestedResponses = this.generateSuggestions(userIntent, topics);

    // Find related conversations
    const relatedConversations = await this.findRelatedConversations(topics, conversationId);

    return {
      recentMessages,
      topics,
      sentiment,
      userIntent,
      suggestedResponses,
      relatedConversations
    };
  }

  // Extract topics from text
  private extractTopics(text: string): string[] {
    const lowerText = text.toLowerCase();
    const topics: string[] = [];

    for (const [topic, keywords] of Object.entries(this.TOPIC_KEYWORDS)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }

    return [...new Set(topics)];
  }

  // Analyze sentiment
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ['great', 'excellent', 'good', 'thanks', 'perfect', 'wonderful', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'poor', 'awful', 'disappointed', 'issue', 'problem'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Detect user intent
  private detectIntent(message: string, topics: string[]): string {
    const lowerMessage = message.toLowerCase();

    // Question intent
    if (lowerMessage.includes('?') || lowerMessage.startsWith('what') || 
        lowerMessage.startsWith('how') || lowerMessage.startsWith('when') ||
        lowerMessage.startsWith('where') || lowerMessage.startsWith('why')) {
      return 'question';
    }

    // Request intent
    if (topics.includes('quote') || lowerMessage.includes('need') || 
        lowerMessage.includes('looking for')) {
      return 'request';
    }

    // Booking intent
    if (topics.includes('booking') || lowerMessage.includes('schedule')) {
      return 'booking';
    }

    // Job search intent
    if (topics.includes('jobs') || lowerMessage.includes('search')) {
      return 'job_search';
    }

    // General conversation
    return 'conversation';
  }

  // Generate response suggestions
  private generateSuggestions(intent: string, topics: string[]): string[] {
    const suggestions: string[] = [];

    if (intent === 'question') {
      suggestions.push('I can help answer that question.');
      if (topics.includes('quote')) {
        suggestions.push('Would you like me to provide a detailed quote?');
      }
    }

    if (intent === 'request' || topics.includes('clearance')) {
      suggestions.push('I can help arrange that service for you.');
      suggestions.push('When would you like to schedule this?');
    }

    if (intent === 'job_search') {
      suggestions.push('Let me search for relevant jobs on Facebook.');
      suggestions.push('What type of work are you interested in?');
    }

    if (topics.includes('handyman')) {
      suggestions.push('We offer comprehensive handyman services including repairs, maintenance, and installations.');
    }

    return suggestions;
  }

  // Find related past conversations
  private async findRelatedConversations(
    topics: string[],
    currentId: string
  ): Promise<string[]> {
    if (topics.length === 0) return [];

    const allConversations = await conversationMemory.getAllConversations(50);
    
    return allConversations
      .filter(conv => conv.id !== currentId)
      .filter(conv => {
        const convText = conv.messages.map(m => m.content).join(' ').toLowerCase();
        return topics.some(topic => 
          this.TOPIC_KEYWORDS[topic as keyof typeof this.TOPIC_KEYWORDS]
            ?.some(keyword => convText.includes(keyword))
        );
      })
      .slice(0, 3)
      .map(conv => conv.id);
  }

  // Generate system prompt with context
  private generateSystemPrompt(context: ConversationContext): string {
    let prompt = `You are MAAD (Man About A Dog), a professional AI assistant for a clearance and handyman service in Belfast, Northern Ireland.

Services offered:
- House & office clearance
- Junk removal & waste disposal
- Handyman repairs & maintenance
- Electrical, plumbing, carpentry work
- Garden clearance & landscaping
- Moving & furniture assembly

`;

    // Add context-specific instructions
    if (context.topics.length > 0) {
      prompt += `Current conversation topics: ${context.topics.join(', ')}\n`;
    }

    if (context.userIntent === 'quote') {
      prompt += `The user is requesting a quote. Be specific about pricing factors and offer to discuss details.\n`;
    }

    if (context.userIntent === 'booking') {
      prompt += `The user wants to book a service. Ask for specific dates, times, and service requirements.\n`;
    }

    if (context.userIntent === 'job_search') {
      prompt += `The user is looking for jobs. Focus on helping them find relevant opportunities.\n`;
    }

    // Add sentiment-based tone
    if (context.sentiment === 'positive') {
      prompt += `The user seems pleased. Maintain a friendly, enthusiastic tone.\n`;
    } else if (context.sentiment === 'negative') {
      prompt += `The user may have concerns. Be empathetic, helpful, and solution-focused.\n`;
    }

    prompt += `\nRespond professionally, concisely, and helpfully. Always aim to provide value and move the conversation forward.`;

    return prompt;
  }

  // Generate context summary for prompt
  private generateContextSummary(context: ConversationContext): string {
    if (context.recentMessages.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const summary: string[] = [];

    // Summarize recent messages
    const lastUserMessages = context.recentMessages
      .filter(m => m.role === 'user')
      .slice(-3);

    if (lastUserMessages.length > 0) {
      summary.push('Recent conversation:');
      lastUserMessages.forEach((msg, idx) => {
        summary.push(`- User: "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"`);
      });
    }

    // Add topic context
    if (context.topics.length > 0) {
      summary.push(`\nTopics discussed: ${context.topics.join(', ')}`);
    }

    // Add related conversations
    if (context.relatedConversations.length > 0) {
      summary.push(`\nThe user has ${context.relatedConversations.length} related past conversation(s).`);
    }

    return summary.join('\n');
  }

  // Format full prompt for Base44
  formatPromptForBase44(contextualPrompt: ContextualPrompt): string {
    let fullPrompt = '';

    // Add system context
    if (contextualPrompt.metadata.hasHistory) {
      fullPrompt += `[Context: ${contextualPrompt.context}]\n\n`;
    }

    // Add system prompt
    fullPrompt += `[System Instructions: ${contextualPrompt.systemPrompt}]\n\n`;

    // Add user message
    fullPrompt += `User: ${contextualPrompt.userMessage}`;

    return fullPrompt;
  }

  // Learn from conversation (update topics, preferences)
  async learnFromConversation(conversationId: string): Promise<void> {
    const conversation = await conversationMemory.getConversation(conversationId);
    if (!conversation) return;

    // Extract all topics from conversation
    const allText = conversation.messages.map(m => m.content).join(' ');
    const topics = this.extractTopics(allText);

    // Update conversation metadata
    if (conversation.metadata) {
      conversation.metadata.tags = topics;
      
      // Generate conversation summary (first user message + last assistant message)
      const firstUserMsg = conversation.messages.find(m => m.role === 'user');
      const lastAssistantMsg = [...conversation.messages]
        .reverse()
        .find(m => m.role === 'assistant');

      if (firstUserMsg && lastAssistantMsg) {
        conversation.metadata.summary = 
          `${firstUserMsg.content.substring(0, 50)}... → ${lastAssistantMsg.content.substring(0, 50)}...`;
      }

      await conversationMemory.saveConversation(conversation);
    }
  }

  // Get conversation insights
  async getInsights(conversationId: string): Promise<{
    topics: string[];
    messageCount: number;
    duration: number;
    averageResponseLength: number;
    sentiment: string;
  }> {
    const conversation = await conversationMemory.getConversation(conversationId);
    if (!conversation) {
      return {
        topics: [],
        messageCount: 0,
        duration: 0,
        averageResponseLength: 0,
        sentiment: 'neutral'
      };
    }

    const allText = conversation.messages.map(m => m.content).join(' ');
    const topics = this.extractTopics(allText);
    
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant');
    const averageResponseLength = assistantMessages.length > 0
      ? assistantMessages.reduce((sum, m) => sum + m.content.length, 0) / assistantMessages.length
      : 0;

    const duration = conversation.updatedAt - conversation.createdAt;
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const sentiment = lastMessage ? this.analyzeSentiment(lastMessage.content) : 'neutral';

    return {
      topics,
      messageCount: conversation.messages.length,
      duration,
      averageResponseLength: Math.round(averageResponseLength),
      sentiment
    };
  }
}

// Singleton instance
export const contextAwareness = new ContextAwarenessService();

export default ContextAwarenessService;