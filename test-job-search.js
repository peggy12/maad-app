// Test Facebook job search functionality with new token
import { searchFacebookJobs } from './searchFacebookJobs.js';

console.log('🔍 Testing Facebook Job Search...');
console.log('===================================');

const testSearch = async () => {
  try {
    const result = await searchFacebookJobs({
      pageId: '820172544505737',
      accessToken: 'EAAIFQlajmvcBPuHophvJ3uAVtYQNeE1mxKYnJbldJu07yTz5SJCn9IiCFHR7kVgZAewZCSLnJCtwRzH4ZCZB6BDTw6EfBfZBQ7om8y4hlIAxG07eWkr9IUGfydo1DbSIOEADcJ4ZBpoa5eZBAnoAm1BwPMn7pZAhoOPXRl1TLbsku8k0J9MTeutoCfxiI9IXZBHxFU4nI',
      limit: 10,
      minJobScore: 0.3
    });

    console.log('✅ Search Results:');
    console.log('Success:', result.success);
    console.log('Total Posts Checked:', result.totalPosts);
    console.log('Jobs Found:', result.jobs.length);
    
    if (result.error) {
      console.log('❌ Error:', result.error);
    }

    if (result.jobs.length > 0) {
      console.log('\n📋 Job Posts Found:');
      result.jobs.forEach((job, index) => {
        console.log(`\n${index + 1}. Job Score: ${job.jobScore.toFixed(2)}`);
        console.log(`   Keywords: ${job.matchedKeywords.join(', ')}`);
        console.log(`   Post: ${job.message.substring(0, 100)}...`);
      });
    } else {
      console.log('\n📝 No job posts found (this is normal if your page has no job-related posts)');
    }

  } catch (error) {
    console.log('❌ Test Error:', error.message);
  }
};

testSearch();