/**
 * Demo script showing how to search Facebook feeds for jobs
 * Run this with: deno run --allow-net facebook-job-search-demo.ts
 */

import { searchFacebookFeedForJobs } from './searchFacebookJobs.ts';

// Demo configuration - replace with your actual values
const DEMO_CONFIG = {
  pageId: "YOUR_FACEBOOK_PAGE_ID", // Replace with actual page ID
  accessToken: "YOUR_FACEBOOK_ACCESS_TOKEN", // Replace with actual token
  limit: 25,
  minJobScore: 0.3
};

/**
 * Demo function to search for jobs
 */
async function demoJobSearch() {
  console.log("🔍 Searching Facebook feed for job posts...\n");

  try {
    const result = await searchFacebookFeedForJobs({
      pageId: DEMO_CONFIG.pageId,
      accessToken: DEMO_CONFIG.accessToken,
      limit: DEMO_CONFIG.limit,
      minJobScore: DEMO_CONFIG.minJobScore
    });

    if (!result.success) {
      console.error("❌ Search failed:", result.error);
      return;
    }

    console.log(`✅ Found ${result.jobs.length} job posts out of ${result.totalPosts} total posts\n`);

    if (result.jobs.length === 0) {
      console.log("No job posts found with the current criteria.");
      console.log("Try lowering the minJobScore or increasing the limit.");
      return;
    }

    // Display results
    result.jobs.forEach((job, index) => {
      const score = (job.jobScore * 100).toFixed(1);
      const date = new Date(job.created_time).toLocaleDateString();
      
      console.log(`\n📋 Job ${index + 1}:`);
      console.log(`   Page: ${job.from?.name || 'Unknown'}`);
      console.log(`   Date: ${date}`);
      console.log(`   Score: ${score}%`);
      console.log(`   Keywords: ${job.matchedKeywords.join(', ')}`);
      console.log(`   Message: "${job.message.substring(0, 150)}${job.message.length > 150 ? '...' : ''}"`);
      
      if (job.permalink_url) {
        console.log(`   URL: ${job.permalink_url}`);
      }
      
      console.log("   " + "─".repeat(50));
    });

    if (result.hasMore) {
      console.log("\n📄 More results available. Increase limit to see more posts.");
    }

  } catch (error) {
    console.error("❌ Error during search:", error instanceof Error ? error.message : String(error));
  }
}

/**
 * Demo function showing different search parameters
 */
async function demoAdvancedSearch() {
  console.log("\n\n🔍 Advanced Search Examples:\n");

  // High confidence jobs only
  console.log("1. High confidence jobs (score >= 0.7):");
  try {
    const highConfidenceResult = await searchFacebookFeedForJobs({
      pageId: DEMO_CONFIG.pageId,
      accessToken: DEMO_CONFIG.accessToken,
      limit: 10,
      minJobScore: 0.7
    });

    if (highConfidenceResult.success) {
      console.log(`   Found ${highConfidenceResult.jobs.length} high-confidence job posts`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Recent jobs (last 7 days)
  console.log("\n2. Recent jobs (last 7 days):");
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentResult = await searchFacebookFeedForJobs({
      pageId: DEMO_CONFIG.pageId,
      accessToken: DEMO_CONFIG.accessToken,
      limit: 15,
      minJobScore: 0.2,
      since: sevenDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD format
    });

    if (recentResult.success) {
      console.log(`   Found ${recentResult.jobs.length} recent job posts`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Large search
  console.log("\n3. Large search (100 posts max):");
  try {
    const largeResult = await searchFacebookFeedForJobs({
      pageId: DEMO_CONFIG.pageId,
      accessToken: DEMO_CONFIG.accessToken,
      limit: 100,
      minJobScore: 0.1
    });

    if (largeResult.success) {
      console.log(`   Searched ${largeResult.totalPosts} posts, found ${largeResult.jobs.length} job posts`);
    }
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Run demos
if (import.meta.main) {
  console.log("Facebook Job Search Demo");
  console.log("========================");
  
  // Check if configuration is set
  if (DEMO_CONFIG.pageId === "YOUR_FACEBOOK_PAGE_ID" || DEMO_CONFIG.accessToken === "YOUR_FACEBOOK_ACCESS_TOKEN") {
    console.log("\n⚠️  Please update DEMO_CONFIG with your actual Facebook Page ID and Access Token");
    console.log("\nTo get these values:");
    console.log("1. Page ID: Go to your Facebook page → About → Page Info");
    console.log("2. Access Token: Facebook Developers → Graph API Explorer");
    console.log("   Required permissions: pages_read_engagement, pages_show_list");
  } else {
    await demoJobSearch();
    await demoAdvancedSearch();
  }
  
  console.log("\n✨ Demo completed!");
}