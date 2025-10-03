import 'dotenv/config';

const ACCESS_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;

console.log('🔍 Fetching your Facebook pages...\n');

async function getPageInfo() {
  try {
    // Get pages the user manages
    const response = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${ACCESS_TOKEN}`
    );
    const data = await response.json();

    if (data.error) {
      console.error(`❌ Error: ${data.error.message}`);
      console.error(`Error Code: ${data.error.code}\n`);
      
      if (data.error.code === 190) {
        console.log('⚠️  Your token expired. Get a new User Access Token from:');
        console.log('   https://developers.facebook.com/tools/explorer/');
        console.log('   Make sure to select your MAAD app and get a User token (not Page token)');
      }
      return;
    }

    if (!data.data || data.data.length === 0) {
      console.log('⚠️  No pages found. This could mean:');
      console.log('   1. Token needs pages_show_list permission');
      console.log('   2. You need to use a User Access Token (not Page token)');
      console.log('\n   Go to Graph API Explorer:');
      console.log('   - Select your MAAD app');
      console.log('   - Click "Get Token" → "Get User Access Token"');
      console.log('   - Check: pages_show_list, pages_read_engagement, pages_manage_posts');
      return;
    }

    console.log(`✅ Found ${data.data.length} page(s)!\n`);
    
    for (const page of data.data) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📄 Page Name: ${page.name}`);
      console.log(`📋 Page ID: ${page.id}`);
      console.log(`🔑 Page Access Token: ${page.access_token}`);
      console.log(`📁 Category: ${page.category || 'N/A'}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      // Test if we can post to this page
      console.log(`🧪 Testing post to "${page.name}"...`);
      const testResponse = await fetch(
        `https://graph.facebook.com/v20.0/${page.id}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: '🔧 Test post from MAAD app! API is working! 🎉',
            access_token: page.access_token
          })
        }
      );

      const testData = await testResponse.json();

      if (testData.error) {
        console.log(`   ❌ Post failed: ${testData.error.message}`);
      } else {
        console.log(`   ✅ SUCCESS! Post created with ID: ${testData.id}`);
        console.log(`\n🎉 Your page is ready for API posting!`);
        console.log(`\n📝 Update your .env file with:`);
        console.log(`   VITE_FACEBOOK_PAGE_ID=${page.id}`);
        console.log(`   VITE_FACEBOOK_ACCESS_TOKEN=${page.access_token}`);
        console.log(`   FACEBOOK_PAGE_ACCESS_TOKEN=${page.access_token}`);
        console.log(`   FACEBOOK_PAGE_ID=${page.id}\n`);
      }
    }

  } catch (error) {
    console.error(`❌ Network error: ${error.message}`);
  }
}

getPageInfo();
