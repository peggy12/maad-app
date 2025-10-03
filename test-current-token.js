// Test the current token for MAAD job search functionality
const userToken = 'EAALJ8ZARqdeIBPqcuN8z5UZBsVF0irxICxccaV70CRiTsgjK7RH07XLZB5u6XWifEXM0LZBtxZBur3xThMWoty44nWkgYolsEI1X11tv08ZBvZBHIHM0rgOrgp9qsosWQoa1TJxjdppWRE07Vn355SHM8vVJ5499Doh7NWjSjlCjX03ZA2bElolZBCz2YoKf051a7gxTNqKZCk4aWwg1CN6fOvkkwJRanlnQwAKM1dKxMP4YiXW7YZD';
const pageId = '820172544505737';

console.log('Testing current token for MAAD job search...');
console.log('Token length:', userToken.length);

// Test the exact API call that MAAD uses
const apiUrl = `https://graph.facebook.com/${pageId}/posts?limit=25&access_token=${userToken}`;

console.log('\nTesting Facebook API call for job search:');
console.log('URL (without token):', `https://graph.facebook.com/${pageId}/posts?limit=25`);

fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.log('\n❌ API Error:');
      console.log('Error code:', data.error.code);
      console.log('Error message:', data.error.message);
      console.log('Error type:', data.error.type);
      
      if (data.error.error_user_msg) {
        console.log('User message:', data.error.error_user_msg);
      }
      
      console.log('\n🔧 This confirms we need a Page Access Token, not a User Access Token');
    } else {
      console.log('\n✅ Success! Posts found:', data.data?.length || 0);
      if (data.data && data.data.length > 0) {
        console.log('First post preview:', data.data[0].message?.substring(0, 100) + '...');
      }
    }
  })
  .catch(error => {
    console.error('\n❌ Network Error:', error.message);
  });