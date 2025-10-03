/**
 * Simple JavaScript integration for searching Facebook feeds for jobs
 * Can be used with your existing useSendMessage hook
 */

import { searchFacebookFeedForJobs } from './searchFacebookJobs';

/**
 * Creates a message sending function that can search for jobs
 * Integrates with your existing useSendMessage pattern
 */
export function createJobSearchHandler({
  agentSDK,
  conversation,
  setIsLoading,
  pageId,
  accessToken
}) {
  const searchForJobs = async (searchQuery) => {
    if (!pageId || !accessToken) {
      throw new Error('Facebook Page ID and Access Token are required');
    }

    setIsLoading(true);

    try {
      // Parse search parameters from query
      const params = parseSearchQuery(searchQuery);
      
      // Search for jobs
      const result = await searchFacebookFeedForJobs({
        pageId,
        accessToken,
        limit: params.limit || 25,
        minJobScore: params.minJobScore || 0.3,
        since: params.since,
        until: params.until
      });

      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }

      // Format results for display
      const formattedResults = formatJobSearchResults(result);

      // Send results as a message to the agent
      if (agentSDK && conversation) {
        await agentSDK.addMessage(conversation, {
          role: "assistant",
          content: formattedResults
        });
      }

      return result;

    } finally {
      setIsLoading(false);
    }
  };

  return { searchForJobs };
}

/**
 * Parse search query for parameters
 * Examples: "search facebook jobs limit 50", "find jobs score 0.5"
 */
function parseSearchQuery(query) {
  const params = {};
  
  // Extract limit
  const limitMatch = query.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    params.limit = Math.min(parseInt(limitMatch[1]), 100);
  }

  // Extract minimum score
  const scoreMatch = query.match(/score\s+([\d.]+)/i);
  if (scoreMatch) {
    params.minJobScore = Math.min(Math.max(parseFloat(scoreMatch[1]), 0), 1);
  }

  // Extract date ranges (basic implementation)
  const sinceMatch = query.match(/since\s+(\d{4}-\d{2}-\d{2})/i);
  if (sinceMatch) {
    params.since = sinceMatch[1];
  }

  const untilMatch = query.match(/until\s+(\d{4}-\d{2}-\d{2})/i);
  if (untilMatch) {
    params.until = untilMatch[1];
  }

  return params;
}

/**
 * Format job search results for display
 */
function formatJobSearchResults(result) {
  if (!result.success || result.jobs.length === 0) {
    return `❌ No job posts found. Searched ${result.totalPosts} total posts.`;
  }

  let output = `✅ Found ${result.jobs.length} job posts out of ${result.totalPosts} total posts:\n\n`;

  result.jobs.forEach((job, index) => {
    const score = (job.jobScore * 100).toFixed(1);
    const date = new Date(job.created_time).toLocaleDateString();
    const keywords = job.matchedKeywords.slice(0, 5).join(', ');
    
    output += `**${index + 1}. ${job.from?.name || 'Unknown Page'}** (${score}% job match)\n`;
    output += `📅 ${date}\n`;
    output += `🔑 Keywords: ${keywords}\n`;
    output += `📝 "${job.message.substring(0, 200)}${job.message.length > 200 ? '...' : ''}"\n`;
    
    if (job.permalink_url) {
      output += `🔗 [View Post](${job.permalink_url})\n`;
    }
    
    output += '\n---\n\n';
  });

  if (result.hasMore) {
    output += '📄 More results available. Increase limit to see more posts.';
  }

  return output;
}

/**
 * Enhanced useSendMessage hook with job search capabilities
 * Extends your existing useSendMessage functionality
 */
export function useSendMessageWithJobSearch({
  inputValue,
  uploadedFiles,
  conversation,
  setInputValue,
  setUploadedFiles,
  setIsLoading,
  agentSDK,
  facebookPageId,
  facebookAccessToken
}) {
  const { searchForJobs } = createJobSearchHandler({
    agentSDK,
    conversation,
    setIsLoading,
    pageId: facebookPageId,
    accessToken: facebookAccessToken
  });

  const sendMessage = async () => {
    const content = inputValue.trim();
    const hasFiles = uploadedFiles.length > 0;
    const canSend = (content || hasFiles) && conversation;

    if (!canSend) return;

    // Check if this is a job search command
    const isJobSearchCommand = /search.*facebook.*job|find.*job|facebook.*feed.*job/i.test(content);

    if (isJobSearchCommand && facebookPageId && facebookAccessToken) {
      try {
        setInputValue("");
        await searchForJobs(content);
        return;
      } catch (error) {
        console.error("Job search error:", error);
        // Fall through to regular message sending
      }
    }

    // Regular message sending (your existing logic)
    const currentUploadedFiles = [...uploadedFiles];
    setInputValue("");
    setUploadedFiles([]);
    setIsLoading(true);

    const loadingTimeoutRef = setTimeout(() => {
      setIsLoading(false);
      console.warn("Agent response timeout. Fallback triggered.");
    }, 30000);

    try {
      await agentSDK.addMessage(conversation, {
        role: "user",
        content: content || "I've attached some files for you to look at.",
        file_urls: currentUploadedFiles.map(f => f.url),
      });
    } catch (error) {
      console.error("Send error:", error);
      // Re-add toast if available
      if (typeof toast !== 'undefined') {
        toast.error("Message failed to send. Please try again.");
      }
      setInputValue(content);
      setUploadedFiles(currentUploadedFiles);
      setIsLoading(false);
    } finally {
      if (loadingTimeoutRef) {
        clearTimeout(loadingTimeoutRef);
      }
    }
  };

  return { sendMessage, searchForJobs };
}

/**
 * Simple function to search jobs and return formatted text
 * Can be used independently without React hooks
 */
export async function searchJobsAsText(pageId, accessToken, options = {}) {
  const result = await searchFacebookFeedForJobs({
    pageId,
    accessToken,
    limit: options.limit || 25,
    minJobScore: options.minJobScore || 0.3,
    since: options.since,
    until: options.until
  });

  return formatJobSearchResults(result);
}