// Comprehensive Facebook API diagnostic
const userToken = 'EAAIFQlajmvcBPjgUe2ZB1gmf119OmS1xEf8zyoeXWmSu8hQS5c7JjoG6pc3ZCx9aIbrgZAjh6eLb8iRZCREJEibONn4grUy5IbJmqYjbhKJCAgDtWES1JYMMZBLqyEWihepJmnc5aAZCHwMBJwpCfn8oM2emvZB9BicdBsZBYXuuz6LKicQZB4t1ZCRr4M2PLULfFdDfDZBzlsMLUJdZCx6K7Rd80UKHXTZAGEo9YZCrHYLlf1A8fi0oIZD';
const pageId = '820172544505737';
const appId = '784989367727586';
const appSecret = '39628a11f1b3715a3217d2e13e835872';

console.log('=== FACEBOOK API DIAGNOSTIC ===');
console.log('User Token Length:', userToken.length);
console.log('Page ID:', pageId);
console.log('App ID:', appId);
console.log();

async function runDiagnostic() {
  try {
    // 1. Test token info
    console.log('1. Testing token identity...');
    const meResponse = await fetch(`https://graph.facebook.com/me?access_token=${userToken}`);
    const meData = await meResponse.json();
    console.log('User info:', meData);
    
    // 2. Test permissions
    console.log('\n2. Testing permissions...');
    const permissionsResponse = await fetch(`https://graph.facebook.com/me/permissions?access_token=${userToken}`);
    const permissionsData = await permissionsResponse.json();
    console.log('Permissions:', permissionsData);
    
    // 3. Test pages access
    console.log('\n3. Testing pages access...');
    const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${userToken}`);
    const pagesData = await pagesResponse.json();
    console.log('Pages data:', pagesData);
    
    // 4. Try to get page info directly
    console.log('\n4. Testing direct page access...');
    const pageResponse = await fetch(`https://graph.facebook.com/${pageId}?access_token=${userToken}`);
    const pageData = await pageResponse.json();
    console.log('Page info:', pageData);
    
    // 5. Try app access token approach
    console.log('\n5. Testing App Access Token approach...');
    const appToken = `${appId}|${appSecret}`;
    console.log('App token:', appToken);
    
    const appPageResponse = await fetch(`https://graph.facebook.com/${pageId}?access_token=${appToken}`);
    const appPageData = await appPageResponse.json();
    console.log('Page info with app token:', appPageData);
    
    // 6. Try to get page posts with app token
    console.log('\n6. Testing page posts with App Access Token...');
    const appPostsResponse = await fetch(`https://graph.facebook.com/${pageId}/posts?limit=3&access_token=${appToken}`);
    const appPostsData = await appPostsResponse.json();
    console.log('Posts with app token:', appPostsData);
    
  } catch (error) {
    console.error('Error in diagnostic:', error.message);
  }
}

runDiagnostic();