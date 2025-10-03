import { useCallback, useRef } from "react";
import { toast } from "react-toastify";
// @ts-ignore - jobSearchIntegration.js exists but lacks type definitions
Console.log("");import { searchJobsAsText } from './jobSearchIntegration.js';
import { getBase44Service } from './services/base44Service.js';

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
}: UseSendMessageProps) {
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback(async () => {
    const content = inputValue.trim();
    const hasFiles = uploadedFiles.length > 0;
    const canSend = (content || hasFiles) && conversation;

    if (!canSend) return;

    // Check if this is a job search command
    const isJobSearchCommand = /search.*facebook.*job|find.*job|facebook.*feed.*job|search.*job.*facebook/i.test(content);

    if (isJobSearchCommand && facebookPageId && facebookAccessToken) {
      setInputValue("");
      setIsLoading(true);
      
      try {
        // Extract search parameters from the message
        const limitMatch = content.match(/limit\s+(\d+)/i);
        const scoreMatch = content.match(/score\s+([\d.]+)/i);
        
        const searchOptions = {
          limit: limitMatch?.[1] ? Math.min(parseInt(limitMatch[1]), 100) : 25,
          minJobScore: scoreMatch?.[1] ? Math.min(Math.max(parseFloat(scoreMatch[1]), 0), 1) : 0.3
        };

        const jobSearchResults = await searchJobsAsText(
          facebookPageId, 
          facebookAccessToken, 
          searchOptions
        );

        // Send the job search results as an assistant message
        await agentSDK.addMessage(conversation, {
          role: "assistant",
          content: `🔍 **Facebook Job Search Results**\n\n${jobSearchResults}`,
        });

        toast.success("Job search completed!");
        return;
      } catch (error) {
        console.error("Job search error:  useSendMessage.ts:71 - MAAD-app.ts:71", error);
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

    // Regular message sending logic
    const currentUploadedFiles = [...uploadedFiles];
    setInputValue("");
    setUploadedFiles([]);
    setIsLoading(true);

    loadingTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      console.warn("Agent response timeout. Fallback triggered.  useSendMessage.ts:93 - MAAD-app.ts:93");
    }, 30000);

    try {
      await agentSDK.addMessage(conversation, {
        role: "user",
        content: content || "I've attached some files for you to look at.",
        file_urls: currentUploadedFiles.map(f => f.url),
      });
    } catch (error) {
      console.error("Send error:  useSendMessage.ts:103 - MAAD-app.ts:103", error);
      toast.error("Message failed to send. Please try again.");
      setInputValue(content);
      setUploadedFiles(currentUploadedFiles);
      setIsLoading(false);
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [inputValue, uploadedFiles, conversation, facebookPageId, facebookAccessToken, agentSDK, setInputValue, setUploadedFiles, setIsLoading]);

  return { sendMessage };
}
