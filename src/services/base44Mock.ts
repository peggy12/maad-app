// Mock implementation of Base44 SDK for production builds
export interface Base44Response {
  text: string;
  confidence?: number;
  metadata?: any;
}

export class Base44MockClient {
  private agentId: string;
  private facebookPageId: string;
  private facebookAccessToken: string;

  constructor(config: {
    agentId: string;
    facebookPageId: string;
    facebookAccessToken: string;
  }) {
    this.agentId = config.agentId;
    this.facebookPageId = config.facebookPageId;
    this.facebookAccessToken = config.facebookAccessToken;
  }

  async sendMessage(message: string): Promise<Base44Response> {
    // Mock response for production
    return {
      text: `Base44 Mock Response: I received your message "${message}". This is a mock implementation for production deployment.`,
      confidence: 0.9,
      metadata: {
        agentId: this.agentId,
        timestamp: new Date().toISOString(),
        mockResponse: true
      }
    };
  }

  async getQuote(context?: string): Promise<Base44Response> {
    const quotes = [
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
    ];

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)] || quotes[0];

    return {
      text: randomQuote,
      confidence: 1.0,
      metadata: {
        agentId: this.agentId,
        context,
        timestamp: new Date().toISOString(),
        mockResponse: true
      }
    };
  }
}

export default Base44MockClient;