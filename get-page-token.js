// Alternative method to get Facebook page token
// Step 1: Get a User Access Token from Graph API Explorer first
// Step 2: Run this script with that token

console.log('🔍 Facebook Page Token Helper');
console.log('==============================');
console.log('');
console.log('STEP 1: Get User Access Token');
console.log('1. Go to: https://developers.facebook.com/tools/explorer/');
console.log('2. Select app: "568732432964343 | MAAD"');
console.log('3. Click "Get Token" → "Get User Access Token"');
console.log('4. Grant permissions: pages_read_engagement, pages_show_list');
console.log('5. Copy the token and replace USER_TOKEN below');
console.log('');

// Replace this with your user access token
const USER_TOKEN = 'EAAIFQlajmvcBPhhaLsB2g9MxEzSsdBxEU39uTDbP8vDsvOIq8NTmMDy2KaoBKq1dbeDZCnVves9ZCfwBZAxkG5G6UZCh3oNKZBT552qpvspT6ITpHGqreAdkcBNq3Dw1ZAsXfZClhODeUtK6ZBhmcaHbzeKgxlfoEDEmNry8gVm0AKoEiQzP3pZAdsoeett97';

console.log('✅ Using your provided token to find page tokens...');

console.log('STEP 2: Getting your pages and tokens...');

fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${USER_TOKEN}`)
  .then(r => r.json())
  .then(data => {
    console.log('');
    console.log('📄 Your Facebook Pages:');
    console.log('=======================');
    
    if (data.error) {
      console.log('❌ Error:', data.error.message);
      return;
    }
    
    if (!data.data || data.data.length === 0) {
      console.log('❌ No pages found. Make sure you:');
      console.log('   - Are admin of the page');
      console.log('   - Granted pages_read_engagement permission');
      console.log('   - Used a User Access Token (not App token)');
      return;
    }
    
    data.data.forEach((page, index) => {
      console.log(`${index + 1}. Page: ${page.name}`);
      console.log(`   ID: ${page.id}`);
      console.log(`   Token: ${page.access_token.substring(0, 20)}...`);
      
      // Check if this is our target page
      if (page.id === '820172544505737') {
        console.log(`   ✅ THIS IS YOUR TARGET PAGE!`);
        console.log(`   🔑 COPY THIS TOKEN: ${page.access_token}`);
      }
      console.log('');
    });
    
    console.log('🎯 Look for page ID: 820172544505737');
    console.log('📋 Copy the full access_token for that page');
  })
  .catch(err => {
    console.log('❌ Network error:', err.message);
    console.log('Make sure you have internet connection and valid token');
  });