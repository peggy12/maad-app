/**
 * Base44 SDK Integration for MAAD App
 * 
 * This service handles the Base44 agent integration for both:
 * 1. React chat interface (browser side)
 * 2. Deno server-side processing (main.ts)
 */

// Mock Base44 SDK for production builds
const createClientFromRequest = (request?: any) => ({
  asServiceRole: {
    entities: {},
    integrations: {},
    sso: undefined,
    functions: {
      invoke: async (functionName: string, data: any) => ({ result: 'mock' })
    },
    agents: {
      invoke: async (agentName: string, prompt: string) => ({ 
        output: prompt.toLowerCase().includes('quote') 
          ? "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
          : `I understand your message: "${prompt}". This is a mock response from Base44 service.`
      })
    }
  },
  functions: {},
  auth: {},
  entities: {},
  integrations: {}
});

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

class Base44Service {
  private client: Base44Client | null = null;
  private config: Base44Config = {};
  
  constructor(config?: Base44Config) {
    this.config = {
      agentName: import.meta.env?.VITE_BASE44_AGENT_NAME || 'MAAD',
      baseUrl: import.meta.env?.VITE_BASE44_BASE_URL || 'https://manaboutadog.base44.app',
      apiKey: import.meta.env?.VITE_BASE44_API_KEY,
      facebookPageId: import.meta.env?.VITE_FACEBOOK_PAGE_ID || '820172544505737',
      facebookAccessToken: import.meta.env?.VITE_FACEBOOK_ACCESS_TOKEN,
      ...config
    };
  }
  
  async initialize(request?: Request): Promise<void> {
    try {
      // Check if we have Base44 API credentials for production use
      const hasApiKey = this.config.apiKey && this.config.apiKey !== 'your_api_key_here';
      
      if (hasApiKey && this.config.baseUrl) {
        // Production Base44 API integration
        console.log('✅ Initializing Base44 with API key for agent: - base44Service.ts:84', this.config.agentName);
        
        this.client = {
          asServiceRole: {
            entities: {},
            integrations: {},
            functions: {
              invoke: async () => ({ output: 'Function response' })
            },
            agents: {
              invoke: async (agentName: string, prompt: string) => {
                // Call real Base44 API
                const response = await fetch(`${this.config.baseUrl}/api/agents/${agentName}/invoke`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                  },
                  body: JSON.stringify({ prompt })
                });
                
                if (!response.ok) {
                  throw new Error(`Base44 API error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                return { output: data.output || data.response || String(data) };
              }
            }
          },
          functions: {},
          auth: {},
          entities: {},
          integrations: {}
        };
      } else if (request) {
        // Server-side initialization (Deno/Node.js) with SDK
        const sdkClient = await createClientFromRequest(request);
        // Adapt the SDK client to our interface
        this.client = {
          ...sdkClient,
          asServiceRole: {
            entities: sdkClient.asServiceRole?.entities || {},
            integrations: sdkClient.asServiceRole?.integrations || {},
            sso: sdkClient.asServiceRole?.sso || undefined,
            functions: sdkClient.asServiceRole?.functions || {
              invoke: async () => ({ output: 'Default response' })
            },
            agents: {
              invoke: async (agentName: string, prompt: string) => {
                // Try to use functions.invoke as a fallback for agents
                if (sdkClient.asServiceRole?.functions?.invoke) {
                  const result = await sdkClient.asServiceRole.functions.invoke('agent_' + agentName, { prompt });
                  // Handle different response types
                  if (result && typeof result === 'object') {
                    const anyResult = result as any;
                    if ('data' in anyResult) {
                      return { output: anyResult.data?.output || anyResult.data || String(result) };
                    }
                    if ('output' in anyResult) {
                      return { output: anyResult.output };
                    }
                  }
                  return { output: String(result) };
                }
                return { output: 'Agent invocation not available' };
              }
            }
          }
        };
      } else {
        // Browser-side initialization - use mock or API based on credentials
        console.warn('Browserside Base44 initialization  creating mock client - base44Service.ts:156');
        
        // Mock client for browser development
        this.client = {
          asServiceRole: {
            entities: {},
            integrations: {},
            functions: {
              invoke: async () => ({ output: 'Mock function response' })
            },
            agents: {
              invoke: async (agentName: string, prompt: string) => {
                console.log(`🤖 Mock Base44 Agent ${agentName}: - base44Service.ts:168`, prompt);
                // Return appropriate responses based on the prompt
                if (prompt.includes('IGNORE')) {
                  return { output: 'IGNORE' };
                }
                
                // Smart MAAD responses based on keywords
                const lowerPrompt = prompt.toLowerCase();
                
                // Plumbing-related (check first for specific terms)
                if (lowerPrompt.match(/plumb|sink|tap|toilet|drain|pipe|leak|water|boiler|radiator|bathroom/)) {
                  return { output: `Hi! Yes, MAAD offers plumbing services including leak repairs, sink/tap installations, toilet repairs, drain unblocking, and more. We cover the Fife area. What plumbing issue can we help you with?` };
                }
                
                // Electrical work
                if (lowerPrompt.match(/electric|wiring|socket|fuse|light|power|switch/)) {
                  return { output: `Hello! MAAD provides electrical services - repairs, installations, rewiring, socket fitting, lighting, and more. We're fully qualified and cover Fife. What electrical work do you need?` };
                }
                
                // Clearance/removal (but not if it's about clearing a drain)
                if (lowerPrompt.match(/house clear|junk|waste|rubbish|removal|clearance|garage clear/) && !lowerPrompt.includes('drain')) {
                  return { output: `Hi there! MAAD specializes in house clearances, junk removal, and waste disposal across Fife. We can handle full house clearances, garage clearouts, or general waste. What needs clearing?` };
                }
                
                // Garden work
                if (lowerPrompt.match(/garden|grass|lawn|landscap|hedge|tree|outdoor/)) {
                  return { output: `Hello! MAAD offers garden clearance and basic landscaping services in Fife. We can clear overgrown areas, remove garden waste, cut grass, and tidy up outdoor spaces. What's your garden project?` };
                }
                
                // Painting/decorating
                if (lowerPrompt.match(/paint|decorat|wall|ceiling|brush|roller/)) {
                  return { output: `Hi! MAAD offers painting and decorating services - interior and exterior work across Fife. We can handle rooms, full houses, or exterior painting. What painting work do you have in mind?` };
                }
                
                // Carpentry/handyman
                if (lowerPrompt.match(/carpenter|wood|door|shelf|cabinet|furniture|assemble|fix|repair/)) {
                  return { output: `Hello! MAAD provides general handyman and carpentry services - door repairs, shelf installation, furniture assembly, and general fixes. We're based in Fife. What repairs do you need?` };
                }
                
                // Pricing/quotes
                if (lowerPrompt.match(/price|cost|quote|how much|charge|fee/)) {
                  return { output: `Thanks for your interest! MAAD provides free, no-obligation quotes. Prices depend on the job scope. Could you share more details about what you need? Location in Fife and job description would help us give you an accurate quote.` };
                }
                
                // Default response
                return { output: `Hi there! Thanks for reaching out to MAAD - your local handyman and clearance service in Fife. We handle house clearances, plumbing, electrical work, painting, garden clearance, carpentry, and general repairs. How can we help you today?` };
              }
            }
          },
          functions: {},
          auth: {},
          entities: {},
          integrations: {}
        };
      }
      
      console.log('✅ Base44 SDK initialized successfully - base44Service.ts:207');
    } catch (error) {
      console.error('❌ Failed to initialize Base44 SDK: - base44Service.ts:209', error);
      throw error;
    }
  }
  
  async invokeAgent(prompt: string, agentName?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Base44 client not initialized. Call initialize() first.');
    }
    
    const agent = agentName || this.config.agentName || 'quote_assistant';
    
    try {
      console.log(`🤖 Invoking Base44 agent "${agent}" with prompt: - base44Service.ts:222`, prompt);
      
      const agents = this.client.asServiceRole?.agents;
      if (!agents?.invoke) {
        throw new Error('Agents not available in client');
      }
      const response = await agents.invoke(agent, prompt);
      
      console.log('✅ Base44 agent response: - base44Service.ts:230', response.output);
      return response.output;
    } catch (error) {
      console.error('❌ Base44 agent invocation failed: - base44Service.ts:233', error);
      throw error;
    }
  }
  
  async generateJobReply(postMessage: string, jobAnalysis?: any): Promise<string> {
    const analysisInfo = jobAnalysis ? `Job Analysis: Confidence ${jobAnalysis.confidence}, Category: ${jobAnalysis.category || 'general'}, Keywords: ${jobAnalysis.matchedKeywords.join(', ')}` : '';
    
    const prompt = `You're replying on behalf of MAAD, a professional clearance and handyman service. 

MAAD Services:
- House & office clearance
- Junk removal & waste disposal  
- Handyman repairs & maintenance
- Electrical, plumbing, carpentry work
- Garden clearance & landscaping
- Moving & furniture assembly

${analysisInfo}

Analyze this Facebook post: "${postMessage}"

If it's a genuine job opportunity, respond with:
- Professional greeting
- Relevant MAAD services that match their needs
- Friendly offer to provide quote/help
- Contact encouragement

If it's NOT a job request, respond with "IGNORE".

Keep response under 100 words, friendly but professional.`;

    return this.invokeAgent(prompt);
  }
  
  async generateChatResponse(userMessage: string, context?: string): Promise<string> {
    const contextStr = context ? `Context: ${context}\n\n` : '';
    const prompt = `${contextStr}User message: ${userMessage}\n\nRespond as MAAD, a helpful local handyman and clearance service in Fife, Scotland. Be friendly, professional, and helpful.`;
    
    return this.invokeAgent(prompt);
  }
  
  // Service role methods (for server-side use)
  async invokeAsService(prompt: string, agentName?: string): Promise<string> {
    if (!this.client?.asServiceRole) {
      console.warn('Service role not available, falling back to regular invoke - base44Service.ts:278');
      return this.invokeAgent(prompt, agentName);
    }
    
    const agent = agentName || this.config.agentName || 'quote_assistant';
    
    try {
      const agents = this.client.asServiceRole?.agents;
      if (!agents?.invoke) {
        throw new Error('Service role agents not available');
      }
      const response = await agents.invoke(agent, prompt);
      return response.output;
    } catch (error) {
      console.error('❌ Base44 service role invocation failed: - base44Service.ts:292', error);
      throw error;
    }
  }
  
  // Facebook integration methods
  getFacebookPageId(): string {
    return this.config.facebookPageId || '820172544505737';
  }
  
  getFacebookAccessToken(): string {
    return this.config.facebookAccessToken || 'EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD';
  }
  
  // Combined Facebook + Base44 job response
  async processJobPost(postContent: string, postId?: string): Promise<{ shouldReply: boolean; reply: string }> {
    const analysisPrompt = `Analyze this Facebook post to determine if it's a legitimate job opportunity for MAAD (handyman/clearance service in Fife). If it is, generate a professional reply. If not, respond with "IGNORE".
    
    Post: "${postContent}"
    
    Guidelines:
    - Look for keywords: clearance, handyman, electrician, plumber, garden, waste, junk, repair
    - Consider location mentions (Fife, Kennoway, Kirkcaldy, etc.)
    - Ignore spam, personal posts, or unrelated content
    - Keep replies friendly, professional, and brief`;
    
    const response = await this.invokeAgent(analysisPrompt);
    
    return {
      shouldReply: response !== 'IGNORE' && !response.includes('IGNORE'),
      reply: response
    };
  }
}

// Singleton instance for browser use
let base44Instance: Base44Service | null = null;

export function createBase44Service(config?: Base44Config): Base44Service {
  return new Base44Service(config);
}

export function getBase44Service(): Base44Service {
  if (!base44Instance) {
    base44Instance = new Base44Service({
      agentName: typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_BASE44_AGENT_NAME || 'MAAD',
      baseUrl: typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_BASE44_BASE_URL || 'https://manaboutadog.base44.app',
      apiKey: typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_BASE44_API_KEY,
      facebookPageId: typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_FACEBOOK_PAGE_ID || '820172544505737',
      facebookAccessToken: typeof window !== 'undefined' && (window as any).import?.meta?.env?.VITE_FACEBOOK_ACCESS_TOKEN
    });
  }
  return base44Instance;
}

// Initialize for browser environment
export async function initializeBase44(): Promise<Base44Service> {
  const service = getBase44Service();
  await service.initialize();
  return service;
}

// Environment detection
export const isDenoEnvironment = () => {
  return typeof (globalThis as any).Deno !== 'undefined';
};

export const isBrowserEnvironment = () => {
  return typeof window !== 'undefined';
};

export default Base44Service;