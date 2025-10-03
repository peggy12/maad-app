/**
 * Production Base44 Service - Mock Implementation
 * Used when Base44 SDK is not available in production builds
 */

export interface Base44Client {
  setToken?: (token: string) => void;
  getConfig?: () => { serverUrl: string; appId: string; requiresAuth: boolean };
  asServiceRole: {
    entities: Record<string, any>;
    integrations: Record<string, any>;
    sso?: {
      getAccessToken: (userid: string) => Promise<any>;
    };
    functions: {
      invoke: (functionName: string, data: Record<string, any>) => Promise<any>;
    };
    agents?: {
      invoke: (agentName: string, prompt: string) => Promise<{ output: string }>;
    };
  };
  functions: any;
  auth: any;
  entities: any;
  integrations: any;
}

export interface Base44Config {
  apiKey?: string;
  baseUrl?: string;
  agentName?: string;
  facebookPageId?: string;
  facebookAccessToken?: string;
}

class Base44ServiceProd {
  private config: Base44Config = {};
  
  constructor(config?: Base44Config) {
    this.config = {
      agentName: 'quote_assistant',
      facebookPageId: '820172544505737',
      facebookAccessToken: 'EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD',
      ...config
    };
  }

  async initialize(): Promise<void> {
    console.log('Base44 Mock Service initialized');
  }

  async sendMessage(message: string): Promise<{ output: string }> {
    // Mock responses based on message content
    if (message.toLowerCase().includes('quote')) {
      const quotes = [
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
      ];
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex] ?? quotes[0] ?? "Success comes to those who dare to begin.";
      return { output: randomQuote };
    }

    if (message.toLowerCase().includes('job') || message.toLowerCase().includes('career')) {
      return { 
        output: "I understand you're interested in job opportunities! While I'm currently running in mock mode, in a full deployment I would help you find relevant job postings through Facebook's job search integration." 
      };
    }

    // Default mock response
    return { 
      output: `Mock Base44 Response: I received your message "${message}". This is a demonstration response from the mock Base44 service for production deployment.` 
    };
  }

  async invokeAgent(prompt: string): Promise<{ output: string }> {
    return this.sendMessage(prompt);
  }

  getConfig(): Base44Config {
    return { ...this.config };
  }
}

// Create singleton instance
const base44Service = new Base44ServiceProd();

export { base44Service as default, Base44ServiceProd };