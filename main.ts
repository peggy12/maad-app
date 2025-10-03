// @ts-expect-error: Deno global types
/// <reference types="deno.ns" />

import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { isPotentialJob } from './matchJobKeywords.ts';
import { generateReply } from './generateReply.ts';
import { postFacebookComment } from './postFacebookComment.ts';

// Define types for better type safety
interface DenoEnv {
  get(key: string): string | undefined;
}

interface DenoGlobal {
  env: DenoEnv;
  serve?: (handler: (req: Request) => Promise<Response>) => void;
}

interface GlobalWithDeno {
  Deno?: DenoGlobal;
}

// Type-safe Deno detection
const globalWithDeno = globalThis as GlobalWithDeno;
const isDeno = typeof globalWithDeno.Deno !== "undefined" && 
              typeof globalWithDeno.Deno?.env?.get === "function";

const PAGE_ID = isDeno && globalWithDeno.Deno?.env.get("FACEBOOK_PAGE_ID") || undefined;
const ACCESS_TOKEN = isDeno && globalWithDeno.Deno?.env.get("FACEBOOK_ACCESS_TOKEN") || undefined;
const AGENT_NAME = "quote_assistant";

// Define interfaces for better type safety
interface FacebookPost {
  id: string;
  message?: string;
  created_time?: string;
}

interface FacebookFeedResponse {
  data?: FacebookPost[];
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface FacebookReplyLog {
  post_id: string;
  post_message: string;
  comment_id: string;
  comment_message: string;
  created_at: string;
}

if (isDeno && typeof globalWithDeno.Deno?.serve === "function") {
  globalWithDeno.Deno.serve(async (req: Request): Promise<Response> => {
    const base44 = createClientFromRequest(req);

    if (!PAGE_ID || !ACCESS_TOKEN) {
      return Response.json({
        error: "Facebook environment variables not set",
        missing: {
          page_id: !PAGE_ID,
          access_token: !ACCESS_TOKEN
        }
      }, { status: 500 });
    }

    const feedUrl = `https://graph.facebook.com/v20.0/${PAGE_ID}/feed?fields=id,message,created_time&limit=25&access_token=${ACCESS_TOKEN}`;
    
    let feedResponse: Response;
    try {
      feedResponse = await fetch(feedUrl);
    } catch (error) {
      return Response.json({
        error: "Failed to connect to Facebook API",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 503 });
    }

    if (!feedResponse.ok) {
      let errorData: any;
      try {
        errorData = await feedResponse.json();
      } catch {
        errorData = { message: "Unknown error", type: "fetch_error" };
      }
      return Response.json({
        error: `Facebook Feed API error: ${JSON.stringify(errorData)}`,
        status_code: feedResponse.status
      }, { status: 500 });
    }

    let feedData: FacebookFeedResponse;
    try {
      feedData = await feedResponse.json();
    } catch (error) {
      return Response.json({
        error: "Invalid JSON response from Facebook API",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    const posts = feedData.data || [];

    let repliedLogs: FacebookReplyLog[];
    try {
      repliedLogs = await base44.asServiceRole.entities.FacebookReplyLog.list();
    } catch (error) {
      return Response.json({
        error: "Failed to fetch reply logs",
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

    const repliedPostIds = new Set(repliedLogs.map((log: FacebookReplyLog) => log.post_id));

    const newPosts = posts.filter((post: FacebookPost): post is FacebookPost & { message: string } => 
      typeof post.message === 'string' && 
      post.message.trim().length > 0 && 
      !repliedPostIds.has(post.id)
    );
    
    const results: string[] = [];

    for (const post of newPosts) {
      const postMessage = post.message.toLowerCase();
      if (!isPotentialJob(postMessage)) {
        results.push(`⏭️ Skipped post ${post.id}: No job keywords.`);
        continue;
      }

      try {
        const replyMessage = await generateReply(base44, AGENT_NAME, post.message);
        if (replyMessage.toUpperCase().includes("IGNORE")) {
          results.push(`🤖 Agent ignored post ${post.id}.`);
          continue;
        }

        const commentId = await postFacebookComment(post.id, replyMessage, ACCESS_TOKEN);
        if (commentId) {
          try {
            await base44.asServiceRole.entities.FacebookReplyLog.create({
              post_id: post.id,
              post_message: post.message,
              comment_id: commentId,
              comment_message: replyMessage,
              created_at: new Date().toISOString()
            });
            results.push(`✅ Replied to post ${post.id} with comment ${commentId}.`);
          } catch (logError) {
            results.push(`⚠️ Posted comment ${commentId} to post ${post.id} but failed to log: ${logError instanceof Error ? logError.message : String(logError)}`);
          }
        } else {
          results.push(`❌ Failed to post comment for post ${post.id}.`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push(`❌ Error processing post ${post.id}: ${errorMsg}`);
      }
    }

    return Response.json({
      status: "Completed",
      processed: newPosts.length,
      total_posts: posts.length,
      results
    });
  });
} else {
  console.error("Deno.serve is not available in this environment.");
}