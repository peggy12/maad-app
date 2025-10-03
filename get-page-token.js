// Alternative method to get Facebook page token
// Step 1: Get a User Access Token from Graph API Explorer first
// Step 2: Run this script with that token

console.log('🔍 Facebook Page Token Helper - get-page-token.js:5');
console.log('============================== - get-page-token.js:6');
console.log('');
console.log('STEP 1: Get User Access Token - get-page-token.js:8');
console.log('1. Go to: https://developers.facebook.com/tools/explorer/ - get-page-token.js:9');
console.log('2. Select app: "568732432964343 | MAAD" - get-page-token.js:10');
console.log('3. Click "Get Token" → "Get User Access Token" - get-page-token.js:11');
console.log('4. Grant permissions: pages_read_engagement, pages_show_list - get-page-token.js:12');
console.log('5. Copy the token and replace USER_TOKEN below - get-page-token.js:13');
console.log('');

// Replace this with your user access token
const USER_TOKEN = 'EAAIFQlajmvcBPs8ZAt2dVqqpzYd2pNnopfRxXtWBvPaZAuxZBTaQZBTJkVwAaVZAPNNZAcgB1gDPHYeOnZCHzQH4CrnWGYnDvHjWhUaJRUvOd1lpUzxEqZCe9GJ6VAgsa0hnckqjxs61vvoF7zBxrFZB5V12UPsMVlb80ePYAH7awXOp2OFQVdkah5uDWdN1taGuF';

console.log('✅ Using your provided token to find page tokens... - get-page-token.js:19');

console.log('STEP 2: Getting your pages and tokens... - get-page-token.js:21');

fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${USER_TOKEN}`)
  .then(r => r.json())
  .then(data => {
    console.log('');
    console.log('📄 Your Facebook Pages: - get-page-token.js:27');
    console.log('======================= - get-page-token.js:28');
    
    if (data.error) {
      console.log('❌ Error: - get-page-token.js:31', data.error.message);
      return;
    }
    
    if (!data.data || data.data.length === 0) {
      console.log('❌ No pages found. Make sure you: - get-page-token.js:36');
      console.log('Are admin of the page - get-page-token.js:37');
      console.log('Granted pages_read_engagement permission - get-page-token.js:38');
      console.log('Used a User Access Token (not App token) - get-page-token.js:39');
      return;
    }
    
    data.data.forEach((page, index) => {
      console.log(`${index + 1}. Page: ${page.name} - get-page-token.js:44`);
      console.log(`ID: ${page.id} - get-page-token.js:45`);
      console.log(`Token: ${page.access_token.substring(0, 20)}... - get-page-token.js:46`);
      
      // Check if this is our target page
      if (page.id === '820172544505737') {
        console.log(`✅ THIS IS YOUR TARGET PAGE! - get-page-token.js:50`);
        console.log(`🔑 COPY THIS TOKEN: ${page.access_token} - get-page-token.js:51`);
      }
      console.log('');
    });
    
    console.log('🎯 Look for page ID: 820172544505737 - get-page-token.js:56');
    console.log('📋 Copy the full access_token for that page - get-page-token.js:57');
  })
  .catch(err => {
    console.log('❌ Network error: - get-page-token.js:60', err.message);
    console.log('Make sure you have internet connection and valid token - get-page-token.js:61');
  });