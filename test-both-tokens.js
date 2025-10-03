// Test both Facebook tokens
const pageId = '820172544505737';
const appId = '784989367727586';
const pageToken = 'EAAIFQlajmvcBPiaow9q1MjNPcEjT1ZCpe35wN3yJN0mrSkSZAOc1epqjjXJjXnRDC61M1qMnZA6xt1ygRlsznk1ibtIbyyECiMF2cTlvEPLW2hj6JnSJueaCdfOJZAR13SfClJsxeTfqOZAE1NdEvqIEmnWS07ZB7KTVcZCJpp81iOcwfaPx9sQCV2c1my8abSnTbqDZBPn';
const appToken = '784989367727586|JNdRvBdhjDtGXv43MLOUFEzLNUs';

console.log('🔍 Testing Facebook Configuration...');
console.log('====================================');
console.log('App ID:', appId);
console.log('Page ID:', pageId);
console.log('');

// Test 1: Page Access Token (for reading posts)
console.log('📄 Test 1: Page Access Token (reading posts)');
fetch(`https://graph.facebook.com/v20.0/${pageId}/feed?access_token=${pageToken}&limit=3`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ Page Token Error:', data.error.message, data.error.code);
    } else {
      console.log('✅ Page Token Working!');
      console.log('   Posts found:', data.data ? data.data.length : 0);
    }
    
    // Test 2: App Access Token (for app-level operations)
    console.log('');
    console.log('🔧 Test 2: App Access Token (app info)');
    return fetch(`https://graph.facebook.com/v20.0/${appId}?access_token=${appToken}&fields=name,company`);
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ App Token Error:', data.error.message, data.error.code);
    } else {
      console.log('✅ App Token Working!');
      console.log('   App Name:', data.name || 'Not available');
      console.log('   Company:', data.company || 'Not specified');
    }
    
    console.log('');
    console.log('🎯 Summary:');
    console.log('   Use Page Token for: Reading page posts, job search');
    console.log('   Use App Token for: Webhooks, app-level operations');
  })
  .catch(err => console.log('❌ Network error:', err.message));