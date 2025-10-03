/**
 * Script to add test job posts to your Facebook page
 * This will create sample posts so you can test the job detection
 */

import 'dotenv/config';

const PAGE_ID = process.env.VITE_FACEBOOK_PAGE_ID || '61555264737981';
const ACCESS_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;

// Test job posts to add to your page
const testPosts = [
  "Looking for a reliable handyman in Belfast area. Need fence repairs and some painting done. Must have own tools. Good rates paid! Contact ASAP 🔨",
  
  "URGENT: Need house clearance service this weekend. 3 bedroom house, lots of junk to remove. Belfast North area. Any recommendations? 🏠",
  
  "Anyone know a good electrician? Need some wiring work done in my shop. Licensed and insured required. ⚡",
  
  "Hiring: Plumber needed for bathroom renovation project. Experience required. Competitive pay. Start next week. 🚿",
  
  "Need someone to help with garden clearance and landscaping. Big job, good money. Belfast South area. 🌳",
  
  "Looking for a painter/decorator for 2 bedroom flat. Must have references. When can you start? 🎨"
];

async function addTestPosts() {
  console.log('🔧 MAAD Test Post Creator\n');
  console.log(`Page ID: ${PAGE_ID}`);
  console.log(`Token: ${ACCESS_TOKEN ? '✅ Found' : '❌ Missing'}\n`);

  if (!ACCESS_TOKEN) {
    console.error('❌ Error: No access token found!');
    console.error('Make sure VITE_FACEBOOK_ACCESS_TOKEN is set in .env file');
    process.exit(1);
  }

  console.log(`Adding ${testPosts.length} test posts to your Facebook page...\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testPosts.length; i++) {
    const message = testPosts[i];
    console.log(`[${i + 1}/${testPosts.length}] Posting: "${message.substring(0, 50)}..."`);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${PAGE_ID}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            access_token: ACCESS_TOKEN
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        console.error(`   ❌ Failed: ${data.error.message}`);
        if (data.error.code === 190) {
          console.error('   ⚠️  Token is invalid or expired. Get a new one from Graph API Explorer.');
        } else if (data.error.code === 200) {
          console.error('   ⚠️  Missing permissions. Need pages_manage_posts permission.');
        }
        failCount++;
      } else {
        console.log(`   ✅ Posted! ID: ${data.id}`);
        successCount++;
        
        // Wait 2 seconds between posts to avoid rate limiting
        if (i < testPosts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error(`   ❌ Network error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${testPosts.length}`);

  if (successCount > 0) {
    console.log('\n✨ Success! Your page now has test posts.');
    console.log('🔍 Try searching for jobs in your app now!');
    console.log('   Open http://localhost:3000 and type: "search facebook jobs"');
  } else {
    console.log('\n⚠️  No posts were added. Check the errors above.');
  }
}

// Run the script
addTestPosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
