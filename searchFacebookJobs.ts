import { isPotentialJob, analyzeJobPost } from './matchJobKeywords.js';
import type { JobMatchResult } from './matchJobKeywords.js';

// Types for Facebook API responses
interface FacebookPost {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  from?: {
    name: string;
    id: string;
  };
}

interface FacebookFeedResponse {
  data?: FacebookPost[];
  paging?: {
    previous?: string;
    next?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface JobPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url?: string;
  from?: {
    name: string;
    id: string;
  };
  jobScore: number; // 0-1 score of how likely this is a job post
  matchedKeywords: string[];
  category?: string; // Job category (handyman, clearance, etc.)
  hasLocation: boolean;
  locationMatches?: string[];
  analysis: JobMatchResult;
}

interface SearchJobsOptions {
  pageId: string;
  accessToken: string;
  limit?: number; // Default: 25, Max: 100
  since?: string; // ISO date string
  until?: string; // ISO date string
  minJobScore?: number; // Minimum job score to include (0-1)
  location?: string; // Filter by location keywords
  category?: string; // Filter by job category (handyman, clearance, etc.)
  keywords?: string[]; // Additional keywords to search for
  excludeKeywords?: string[]; // Keywords to exclude from results
}

interface SearchJobsResult {
  success: boolean;
  jobs: JobPost[];
  totalPosts: number;
  error?: string;
  hasMore?: boolean;
  nextPageToken?: string;
}

/**
 * Searches Facebook feed for job-related posts
 * @param options Search configuration options
 * @returns Promise with search results
 */
export async function searchFacebookFeedForJobs(
  options: SearchJobsOptions
): Promise<SearchJobsResult> {
  const {
    pageId,
    accessToken,
    limit = 25,
    since,
    until,
    minJobScore = 0.1
  } = options;

  // Validate inputs
  if (!pageId || !accessToken) {
    return {
      success: false,
      jobs: [],
      totalPosts: 0,
      error: "Page ID and access token are required"
    };
  }

  try {
    // Build the Facebook Graph API URL
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,message,created_time,permalink_url,from',
      limit: Math.min(limit, 100).toString() // Facebook max is 100
    });

    if (since) params.append('since', since);
    if (until) params.append('until', until);

    const feedUrl = `https://graph.facebook.com/v20.0/${pageId}/feed?${params.toString()}`;

    // Fetch the feed
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: "Unknown error", error: { code: response.status } };
      }
      
      return {
        success: false,
        jobs: [],
        totalPosts: 0,
        error: `Facebook API error: ${errorData.error?.message || errorData.message || 'Unknown error'}`
      };
    }

    const feedData: FacebookFeedResponse = await response.json();
    const posts = feedData.data || [];

    // Filter and score posts for job content
    const jobPosts: JobPost[] = [];

    for (const post of posts) {
      if (!post.message || typeof post.message !== 'string') {
        continue;
      }

      // Use enhanced job analysis
      const analysis = analyzeJobPost(post.message);
      
      if (analysis.isJob && analysis.confidence >= minJobScore) {
        // Apply additional filters
        if (options.location && analysis.locationMatches && 
            !analysis.locationMatches.some(loc => 
              loc.toLowerCase().includes(options.location!.toLowerCase())
            )) {
          continue;
        }
        
        if (options.category && analysis.category !== options.category) {
          continue;
        }
        
        if (options.excludeKeywords && 
            options.excludeKeywords.some(keyword => 
              post.message?.toLowerCase().includes(keyword.toLowerCase())
            )) {
          continue;
        }

        const jobPost: JobPost = {
          id: post.id,
          message: post.message,
          created_time: post.created_time || new Date().toISOString(),
          jobScore: analysis.confidence,
          matchedKeywords: analysis.matchedKeywords,
          hasLocation: analysis.hasLocation,
          analysis
        };
        
        if (post.permalink_url) {
          jobPost.permalink_url = post.permalink_url;
        }
        
        if (post.from) {
          jobPost.from = post.from;
        }
        
        if (analysis.category) {
          jobPost.category = analysis.category;
        }
        
        if (analysis.locationMatches) {
          jobPost.locationMatches = analysis.locationMatches;
        }

        jobPosts.push(jobPost);
      }
    }

    // Sort by job score (highest first) and then by date (newest first)
    jobPosts.sort((a, b) => {
      if (Math.abs(a.jobScore - b.jobScore) > 0.1) {
        return b.jobScore - a.jobScore; // Higher score first
      }
      return new Date(b.created_time).getTime() - new Date(a.created_time).getTime();
    });

    const result: SearchJobsResult = {
      success: true,
      jobs: jobPosts,
      totalPosts: posts.length
    };
    
    if (feedData.paging?.next) {
      result.hasMore = true;
      result.nextPageToken = feedData.paging.next;
    }
    
    return result;

  } catch (error) {
    return {
      success: false,
      jobs: [],
      totalPosts: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Calculates a job score for a post (0-1)
 * Higher score means more likely to be a job post
 */
function calculateJobScore(message: string): number {
  const lowerMessage = message.toLowerCase();
  let score = 0;

  // Direct job keywords (high weight)
  const highWeightKeywords = ['hiring', 'job', 'position', 'vacancy', 'career', 'employment'];
  const highWeightMatches = highWeightKeywords.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  score += highWeightMatches * 0.2;

  // Medium weight keywords
  const mediumWeightKeywords = ['work', 'apply', 'candidate', 'interview', 'salary', 'benefits'];
  const mediumWeightMatches = mediumWeightKeywords.filter(keyword => 
    lowerMessage.includes(keyword)
  ).length;
  score += mediumWeightMatches * 0.1;

  // Job-specific patterns
  if (/now hiring|immediately hiring|urgently hiring/i.test(message)) score += 0.3;
  if (/looking for|seeking|need/i.test(message)) score += 0.15;
  if (/join our team|team member/i.test(message)) score += 0.2;
  if (/\$\d+|salary|wage/i.test(message)) score += 0.15;
  if (/full.?time|part.?time|contract|remote/i.test(message)) score += 0.1;

  // Cap at 1.0
  return Math.min(score, 1.0);
}

/**
 * Extracts matched job keywords from a message
 */
function extractMatchedKeywords(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const allKeywords = [
    'hiring', 'job', 'jobs', 'position', 'positions', 'vacancy', 'vacancies',
    'career', 'careers', 'employment', 'work', 'working', 'apply', 'applying',
    'candidate', 'candidates', 'interview', 'interviews', 'salary', 'wage',
    'benefits', 'full-time', 'part-time', 'contract', 'remote', 'onsite'
  ];

  return allKeywords.filter(keyword => lowerMessage.includes(keyword));
}

/**
 * React hook for searching Facebook feeds for jobs
 */
export function useSearchFacebookJobs() {
  const searchJobs = async (options: SearchJobsOptions): Promise<SearchJobsResult> => {
    return await searchFacebookFeedForJobs(options);
  };

  return { searchJobs };
}