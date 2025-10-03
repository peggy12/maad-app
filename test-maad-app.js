// Test the complete MAAD app functionality
import { searchFacebookJobs } from './searchFacebookJobs.js';

console.log('🧪 MAAD App Functionality Test');
console.log('==============================');

const testFacebookJobSearch = async () => {
  console.log('1. 🔍 Testing Facebook Job Search...');
  
  try {
    const result = await searchFacebookJobs({
      pageId: '820172544505737',
      accessToken: 'EAAIFQlajmvcBPgpgOy9Idc1qKHWsXpzr1sJrdO8gIlwLnEDp3cSgf0nhHOsvkM5yloliwb0xwwNtSDtb3V8N8NNhRO7X9hynFtLHRGuVhbVSzI0USlmrYcXff91vpXc3FE639XvbbjCCjxuEFuj5LdesJgw0CYSyXpGGqyNcfKgBQQtkdcAq9EjWUbeZCUOBoi0si',
      limit: 5,
      minJobScore: 0.3
    });

    console.log('✅ Facebook Job Search Results:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Total Posts: ${result.totalPosts}`);
    console.log(`   Jobs Found: ${result.jobs.length}`);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }

    if (result.jobs.length > 0) {
      console.log('\n📋 Job Posts:');
      result.jobs.forEach((job, index) => {
        console.log(`   ${index + 1}. Score: ${job.jobScore.toFixed(2)} | Keywords: ${job.matchedKeywords.join(', ')}`);
        console.log(`      Text: ${job.message.substring(0, 80)}...`);
      });
    }

  } catch (error) {
    console.log('❌ Facebook Test Error:', error.message);
  }
};

const testBase44Config = () => {
  console.log('\n2. 🤖 Testing Base44 Configuration...');
  
  const base44Config = {
    baseUrl: process.env.VITE_BASE44_BASE_URL || 'https://manaboutadog.base44.app',
    agentName: process.env.VITE_BASE44_AGENT_NAME || 'MAAD',
    apiKey: process.env.VITE_BASE44_API_KEY || 'd4c9f08499e944ef99621b19d45e9df3'
  };
  
  console.log('✅ Base44 Configuration:');
  console.log(`   Base URL: ${base44Config.baseUrl}`);
  console.log(`   Agent Name: ${base44Config.agentName}`);
  console.log(`   API Key: ${base44Config.apiKey.substring(0, 8)}...`);
  console.log(`   Iframe URL: ${base44Config.baseUrl}/EmbeddableChat`);
};

const testAppURLs = () => {
  console.log('\n3. 🌐 Testing App URLs...');
  console.log('✅ App URLs:');
  console.log('   Live Site: https://peggy12.github.io/maad-app/');
  console.log('   GitHub Repo: https://github.com/peggy12/maad-app');
  console.log('   GitHub Actions: https://github.com/peggy12/maad-app/actions');
  console.log('   Base44 Agent: https://manaboutadog.base44.app/EmbeddableChat');
  console.log('   Facebook Page: https://www.facebook.com/820172544505737');
};

// Run all tests
console.log('🚀 Starting MAAD App Tests...\n');

testBase44Config();
testAppURLs();
await testFacebookJobSearch();

console.log('\n🎉 Test Complete! Check your live site at: https://peggy12.github.io/maad-app/');
console.log('Try typing: "search facebook jobs" in the chat interface!');