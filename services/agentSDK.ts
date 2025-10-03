/**
 * LivePerson Agent SDK Implementation
 * This is a wrapper that can be easily replaced with the actual LivePerson Agent SDK
 * 
 * To integrate with real LivePerson SDK:
 * 1. Install the actual SDK: npm install @liveperson/agent-sdk (or correct package name)
 * 2. Replace this implementation with: import agentSDK from '@liveperson/agent-sdk'
 * 3. Update the configuration with your LivePerson credentials
 */

export interface AgentSDKInterface {
  // Agent management
  init: (config: AgentSDKConfig) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Conversation management  
  getConversations: () => Promise<Conversation[]>;
  getConversation: (conversationId: string) => Promise<Conversation>;
  
  // Messaging
  sendMessage: (conversationId: string, message: string) => Promise<void>;
  addMessage: (conversationId: string, message: string) => Promise<void>;
  sendFile: (conversationId: string, file: File) => Promise<void>;
  
  // Agent state
  setAgentState: (state: AgentState) => Promise<void>;
  getAgentState: () => Promise<AgentState>;
  
  // Events
  on: (event: string, callback: Function) => void;
  off: (event: string, callback?: Function) => void;
}

export interface AgentSDKConfig {
  accountId?: string | undefined;
  username?: string | undefined;
  password?: string | undefined;
  token?: string | undefined;
  domain?: string | undefined;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
  state: ConversationState;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  role: 'agent' | 'consumer';
  name?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
}

export type ConversationState = 'active' | 'closed' | 'pending';
export type AgentState = 'online' | 'away' | 'busy' | 'offline';

class MockAgentSDK implements AgentSDKInterface {
  private config: AgentSDKConfig = {};
  private connected = false;
  private agentState: AgentState = 'offline';
  private eventListeners: Map<string, Function[]> = new Map();
  
  async init(config: AgentSDKConfig): Promise<void> {
    console.log('🔧 Initializing Agent SDK with config:', config);
    this.config = config;
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Emit initialization complete
    this.emit('init', { success: true });
  }
  
  async connect(): Promise<void> {
    console.log('🔌 Connecting to LivePerson...');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.connected = true;
    this.agentState = 'online';
    
    // Emit connection events
    this.emit('connected');
    this.emit('agentStateChange', this.agentState);
    
    console.log('✅ Connected to LivePerson successfully');
  }
  
  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from LivePerson...');
    
    this.connected = false;
    this.agentState = 'offline';
    
    this.emit('disconnected');
    this.emit('agentStateChange', this.agentState);
    
    console.log('📴 Disconnected from LivePerson');
  }
  
  async getConversations(): Promise<Conversation[]> {
    if (!this.connected) throw new Error('Not connected to LivePerson');
    
    // Mock conversations
    return [
      {
        id: 'conv-1',
        participants: [
          { id: 'agent-1', role: 'agent', name: 'MAAD Agent' },
          { id: 'consumer-1', role: 'consumer', name: 'Customer' }
        ],
        messages: [],
        state: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
  
  async getConversation(conversationId: string): Promise<Conversation> {
    if (!this.connected) throw new Error('Not connected to LivePerson');
    
    const conversations = await this.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    return conversation;
  }
  
  async sendMessage(conversationId: string, message: string): Promise<void> {
    if (!this.connected) throw new Error('Not connected to LivePerson');
    
    console.log(`📤 Sending message to ${conversationId}:`, message);
    
    // Simulate send delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Emit message sent event
    this.emit('messageSent', {
      conversationId,
      message: {
        id: `msg-${Date.now()}`,
        content: message,
        sender: 'agent-1',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    });
  }
  
  async addMessage(conversationId: string, message: string): Promise<void> {
    // Alias for sendMessage - auto-connect if not connected
    if (!this.connected) {
      console.log('⚠️ Auto-connecting for addMessage...');
      await this.connect();
    }
    return this.sendMessage(conversationId, message);
  }
  
  async sendFile(conversationId: string, file: File): Promise<void> {
    if (!this.connected) throw new Error('Not connected to LivePerson');
    
    console.log(`📎 Sending file to ${conversationId}:`, file.name);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.emit('fileSent', {
      conversationId,
      file: {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type
      }
    });
  }
  
  async setAgentState(state: AgentState): Promise<void> {
    console.log(`👤 Setting agent state to: ${state}`);
    
    this.agentState = state;
    this.emit('agentStateChange', state);
  }
  
  async getAgentState(): Promise<AgentState> {
    return this.agentState;
  }
  
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }
  
  private emit(event: string, data?: any): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Factory function to create SDK instance
export function createAgentSDK(): AgentSDKInterface {
  // When you get the real LivePerson SDK, replace this with:
  // return new LivePersonAgentSDK();
  
  return new MockAgentSDK();
}

// Example usage and configuration
export const defaultConfig: AgentSDKConfig = {
  // Add your LivePerson configuration here
  // Note: In production, use Vite environment variables (import.meta.env.VITE_*)
  ...(import.meta.env.VITE_LIVEPERSON_ACCOUNT_ID && { accountId: import.meta.env.VITE_LIVEPERSON_ACCOUNT_ID }),
  ...(import.meta.env.VITE_LIVEPERSON_USERNAME && { username: import.meta.env.VITE_LIVEPERSON_USERNAME }),
  ...(import.meta.env.VITE_LIVEPERSON_PASSWORD && { password: import.meta.env.VITE_LIVEPERSON_PASSWORD }),
  ...(import.meta.env.VITE_LIVEPERSON_TOKEN && { token: import.meta.env.VITE_LIVEPERSON_TOKEN }),
  domain: import.meta.env.VITE_LIVEPERSON_DOMAIN || 'va-a.ac.liveperson.net'
};