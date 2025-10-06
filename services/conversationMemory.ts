/**
 * Conversation Memory System for MAAD App
 * Implements persistent storage and retrieval of conversation history
 * Uses IndexedDB for robust offline storage with localStorage fallback
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    tokens?: number;
    responseTime?: number;
    cached?: boolean;
    sentiment?: 'positive' | 'negative' | 'neutral';
    topics?: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
  metadata?: {
    totalMessages: number;
    lastUserMessage?: string;
    summary?: string;
    tags?: string[];
  };
}

export interface UserPreferences {
  userId: string;
  preferredTopics: string[];
  conversationStyle: 'formal' | 'casual' | 'technical';
  responseLength: 'brief' | 'detailed';
  language: string;
  timezone: string;
}

class ConversationMemory {
  private dbName = 'maad_conversations';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private storeName = 'conversations';
  private preferencesStore = 'preferences';
  
  constructor() {
    this.initDB();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available, using localStorage fallback');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ ConversationMemory: IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create conversations store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const conversationStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          conversationStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          conversationStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create preferences store
        if (!db.objectStoreNames.contains(this.preferencesStore)) {
          db.createObjectStore(this.preferencesStore, { keyPath: 'userId' });
        }

        console.log('✅ ConversationMemory: Database schema created');
      };
    });
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Save conversation
  async saveConversation(conversation: Conversation): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(conversation);

        request.onsuccess = () => {
          console.log('✅ Conversation saved:', conversation.id);
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to save conversation:', request.error);
          reject(request.error);
        };
      });
    } else {
      // Fallback to localStorage
      const key = `conversation_${conversation.id}`;
      localStorage.setItem(key, JSON.stringify(conversation));
    }
  }

  // Get conversation by ID
  async getConversation(id: string): Promise<Conversation | null> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error('Failed to get conversation:', request.error);
          reject(request.error);
        };
      });
    } else {
      // Fallback to localStorage
      const key = `conversation_${id}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
  }

  // Get all conversations (sorted by most recent)
  async getAllConversations(limit = 50): Promise<Conversation[]> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('updatedAt');
        const request = index.openCursor(null, 'prev');
        
        const conversations: Conversation[] = [];

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && conversations.length < limit) {
            conversations.push(cursor.value);
            cursor.continue();
          } else {
            resolve(conversations);
          }
        };

        request.onerror = () => {
          console.error('Failed to get conversations:', request.error);
          reject(request.error);
        };
      });
    } else {
      // Fallback to localStorage
      const conversations: Conversation[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('conversation_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            conversations.push(JSON.parse(stored));
          }
        }
      }
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
    }
  }

  // Add message to conversation
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: ConversationMessage['metadata']
  ): Promise<ConversationMessage> {
    const message: ConversationMessage = {
      id: this.generateId(),
      role,
      content,
      timestamp: Date.now(),
      ...(metadata && { metadata })
    };

    let conversation = await this.getConversation(conversationId);

    if (!conversation) {
      // Create new conversation
      conversation = {
        id: conversationId,
        title: this.generateTitle(content),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          totalMessages: 0
        }
      };
    }

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    conversation.metadata!.totalMessages = conversation.messages.length;
    
    if (role === 'user') {
      conversation.metadata!.lastUserMessage = content;
    }

    await this.saveConversation(conversation);
    return message;
  }

  // Generate conversation title from first message
  private generateTitle(content: string): string {
    const maxLength = 50;
    const cleaned = content.trim().replace(/\s+/g, ' ');
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned || 'New Conversation';
  }

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);

        request.onsuccess = () => {
          console.log('✅ Conversation deleted:', id);
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to delete conversation:', request.error);
          reject(request.error);
        };
      });
    } else {
      const key = `conversation_${id}`;
      localStorage.removeItem(key);
    }
  }

  // Search conversations by content
  async searchConversations(query: string): Promise<Conversation[]> {
    const allConversations = await this.getAllConversations(100);
    const lowerQuery = query.toLowerCase();

    return allConversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(lowerQuery)) return true;

      // Search in messages
      return conv.messages.some(msg =>
        msg.content.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Get conversation context (last N messages)
  async getConversationContext(
    conversationId: string,
    messageCount = 5
  ): Promise<ConversationMessage[]> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return [];

    return conversation.messages.slice(-messageCount);
  }

  // Save user preferences
  async savePreferences(preferences: UserPreferences): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.preferencesStore], 'readwrite');
        const store = transaction.objectStore(this.preferencesStore);
        const request = store.put(preferences);

        request.onsuccess = () => {
          console.log('✅ Preferences saved');
          resolve();
        };

        request.onerror = () => {
          console.error('Failed to save preferences:', request.error);
          reject(request.error);
        };
      });
    } else {
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
    }
  }

  // Get user preferences
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.preferencesStore], 'readonly');
        const store = transaction.objectStore(this.preferencesStore);
        const request = store.get(userId);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error('Failed to get preferences:', request.error);
          reject(request.error);
        };
      });
    } else {
      const stored = localStorage.getItem('user_preferences');
      return stored ? JSON.parse(stored) : null;
    }
  }

  // Get storage statistics
  async getStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    oldestConversation: number;
    newestConversation: number;
  }> {
    const conversations = await this.getAllConversations(1000);
    const totalMessages = conversations.reduce(
      (sum, conv) => sum + conv.messages.length,
      0
    );

    return {
      totalConversations: conversations.length,
      totalMessages,
      oldestConversation: conversations.length > 0
        ? Math.min(...conversations.map(c => c.createdAt))
        : 0,
      newestConversation: conversations.length > 0
        ? Math.max(...conversations.map(c => c.updatedAt))
        : 0
    };
  }

  // Clear all data
  async clearAll(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName, this.preferencesStore], 'readwrite');
        
        const conversationStore = transaction.objectStore(this.storeName);
        const preferencesStore = transaction.objectStore(this.preferencesStore);
        
        conversationStore.clear();
        preferencesStore.clear();

        transaction.oncomplete = () => {
          console.log('✅ All conversation data cleared');
          resolve();
        };

        transaction.onerror = () => {
          console.error('Failed to clear data:', transaction.error);
          reject(transaction.error);
        };
      });
    } else {
      // Clear localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('conversation_') || key === 'user_preferences') {
          localStorage.removeItem(key);
        }
      }
    }
  }
}

// Singleton instance
export const conversationMemory = new ConversationMemory();

export default ConversationMemory;