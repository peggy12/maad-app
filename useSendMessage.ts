import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
// @ts-ignore - jobSearchIntegration.js exists but lacks type definitions
import { searchJobsAsText } from './jobSearchIntegration.js';
import { getBase44Service } from './services/base44Service.js';
import type Base44Service from './services/base44Service.js';
import { conversationMemory } from './services/conversationMemory.js';

interface UseSendMessageProps {
  inputValue: string;
  uploadedFiles: Array<{ url: string }>;
  conversation: any;
  setInputValue: (value: string) => void;
  setUploadedFiles: (files: Array<{ url: string }>) => void;
  setIsLoading: (loading: boolean) => void;
  agentSDK: any;
  facebookPageId?: string;
  facebookAccessToken?: string;
  addMessage?: (role: string, content: string) => void;
  base44Service?: Base44Service;
}

export function useSendMessage({
  inputValue,
  uploadedFiles,
  conversation,
  setInputValue,
  setUploadedFiles,
  setIsLoading,
  agentSDK,
  facebookPageId,
  facebookAccessToken,
  addMessage,
  base44Service,
}: UseSendMessageProps) {
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [conversationId, setConversationId] = useState<string>('');

  // Initialize or load conversation
  useEffect(() => {
    const initConversation = async () => {
      // Check if we have an existing conversation in localStorage
      const savedId = localStorage.getItem('maad_current_conversation_id');
      
      if (savedId) {
        // Load existing conversation
        const existing = await conversationMemory.getConversation(savedId);
        if (existing) {
          setConversationId(savedId);
          console.log('📖 Loaded existing conversation:', savedId);
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
      console.log('✨ Created new conversation:', newId);
    };
    
    initConversation();
  }, []);

  const sendMessage = useCallback(async () => {
    const content = inputValue.trim();
    const hasFiles = uploadedFiles.length > 0;
    const canSend = (content || hasFiles) && conversation;

    if (!canSend) return;

    // Check if this is a job search command with enhanced pattern matching
    const isJobSearchCommand = /(?:search|find|look\s+for).*(?:facebook|jobs?|work|gigs?)|(?:facebook|jobs?|work).*(?:search|find)|job\s+hunt/i.test(content);
    
    if (isJobSearchCommand && facebookPageId && facebookAccessToken) {
      setInputValue("");
      setIsLoading(true);

      try {
        // Extract enhanced search parameters from the message
        const limitMatch = content.match(/limit\s+(\d+)/i);
        const scoreMatch = content.match(/score\s+([\d.]+)/i);
        const locationMatch = content.match(/(?:in|near|around)\s+([a-zA-Z\s]+?)(?:\s|$)/i);
        const categoryMatch = content.match(/(?:category|type)\s+(\w+)/i) || 
                            content.match(/\b(handyman|clearance|electrical|plumbing|building)\b/i);
        const sinceMatch = content.match(/since\s+([\d-]+)/i);
        const untilMatch = content.match(/until\s+([\d-]+)/i);
        
        // Enhanced keyword extraction
        const excludeMatch = content.match(/(?:exclude|not|without)\s+([^,\s]+(?:,\s*[^,\s]+)*)/i);
        const keywordMatch = content.match(/(?:keywords?|include)\s+([^,\s]+(?:,\s*[^,\s]+)*)/i);        // Build enhanced search options with proper typing
        const searchOptions: any = {
          pageId: facebookPageId,
          accessToken: facebookAccessToken,
          limit: limitMatch?.[1] ? Math.min(parseInt(limitMatch[1]), 100) : 25,
          minJobScore: scoreMatch?.[1] ? Math.min(Math.max(parseFloat(scoreMatch[1]), 0), 1) : 0.3
        };
        
        // Add optional parameters only if they exist
        if (locationMatch?.[1]?.trim()) {
          searchOptions.location = locationMatch[1].trim();
        }
        if (categoryMatch?.[1]) {
          searchOptions.category = categoryMatch[1].toLowerCase();
        }
        if (sinceMatch?.[1]) {
          searchOptions.since = sinceMatch[1];
        }
        if (untilMatch?.[1]) {
          searchOptions.until = untilMatch[1];
        }
        if (keywordMatch?.[1]) {
          searchOptions.keywords = keywordMatch[1].split(',').map(k => k.trim());
        }
        if (excludeMatch?.[1]) {
          searchOptions.excludeKeywords = excludeMatch[1].split(',').map(k => k.trim());
        }

        // Use the enhanced search function
        const { searchFacebookFeedForJobs } = await import('./searchFacebookJobs.js');
        const searchResult = await searchFacebookFeedForJobs(searchOptions);
        
        if (searchResult.success) {
          // Format enhanced job results
          let resultsText = `🔍 **Enhanced Job Search Results**\n\n`;
          resultsText += `Found ${searchResult.jobs.length} jobs from ${searchResult.totalPosts} posts`;
          
          if (searchOptions.location) resultsText += ` near ${searchOptions.location}`;
          if (searchOptions.category) resultsText += ` in ${searchOptions.category}`;
          resultsText += `\n\n`;
          
          searchResult.jobs.forEach((job, index) => {
            resultsText += `**${index + 1}. Job Score: ${job.jobScore}**`;
            if (job.category) resultsText += ` [${job.category.toUpperCase()}]`;
            if (job.hasLocation && job.locationMatches) {
              resultsText += ` 📍 ${job.locationMatches.join(', ')}`;
            }
            resultsText += `\n`;
            resultsText += `${job.message.substring(0, 200)}${job.message.length > 200 ? '...' : ''}\n`;
            resultsText += `Keywords: ${job.matchedKeywords.join(', ')}\n`;
            if (job.permalink_url) resultsText += `Link: ${job.permalink_url}\n`;
            resultsText += `---\n\n`;
          });
          
          // Send the enhanced job search results
          if (addMessage) {
            addMessage('assistant', resultsText);
          }
          
          toast.success(`Found ${searchResult.jobs.length} job opportunities!`);
        } else {
          throw new Error(searchResult.error || 'Job search failed');
        }

        // This was moved up - remove this duplicate code block

        toast.success("Job search completed!");
        return;
      } catch (error) {
        console.error("Job search error: - useSendMessage.ts:70", error);
        toast.error("Job search failed: " + (error instanceof Error ? error.message : String(error)));
        
        // Send error message to conversation
        await agentSDK.addMessage(conversation, {
          role: "assistant",
          content: `❌ Job search failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Regular message sending logic - Use Base44 agent
    const currentUploadedFiles = [...uploadedFiles];
    setInputValue("");
    setUploadedFiles([]);
    setIsLoading(true);

    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      console.warn("Agent response timeout. Fallback triggered. - useSendMessage.ts:92");
    }, 30000);

    try {
      // Save user message to conversation memory
      if (conversationId) {
        await conversationMemory.addMessage(conversationId, 'user', content);
      }
      
      // Display user message in UI
      if (addMessage) {
        addMessage('user', content);
      }
      
      // Get Base44 agent response with context awareness
      const service = base44Service || getBase44Service();
      const agentResponse = await service.generateChatResponse(content, undefined, conversationId);
      
      // Save assistant response to conversation memory
      if (conversationId) {
        await conversationMemory.addMessage(conversationId, 'assistant', agentResponse);
      }
      
      // Display agent response in UI
      if (addMessage) {
        addMessage('assistant', agentResponse);
      }
      
      toast.success('Message sent!');
    } catch (error) {
      console.error("Send error: - useSendMessage.ts:102", error);
      toast.error("Message failed to send. Please try again.");
      setInputValue(content);
      setUploadedFiles(currentUploadedFiles);
    } finally {
      setIsLoading(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [inputValue, uploadedFiles, conversation, facebookPageId, facebookAccessToken, agentSDK, setInputValue, setUploadedFiles, setIsLoading]);

  return { sendMessage };
}
