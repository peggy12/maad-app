// Quick test for Page Access Token
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Page Access Token Tester');
console.log('This will test if your token is a proper Page Access Token\n');

rl.question('Paste your token here: ', (token) => {
  if (!token || token.length < 50) {
    console.log('❌ Token seems too short or empty');
    rl.close();
    return;
  }

  const pageId = '820172544505737';
  console.log('\n🧪 Testing token...');
  console.log('Token length:', token.length);

  // Test token identity
  fetch('https://graph.facebook.com/me?access_token=' + token)
    .then(response => response.json())
    .then(data => {
      console.log('\n📋 Token Identity:');
      console.log('  Name:', data.name);
      console.log('  ID:', data.id);
      
      if (data.id === pageId) {
        console.log('✅ SUCCESS: This is a PAGE ACCESS TOKEN for Maad!');
      } else {
        console.log('❌ WRONG: This is a User Access Token, not a Page token');
        console.log('  Expected ID:', pageId);
        console.log('  Got ID:', data.id);
      }

      // Test posts access
      console.log('\n🔍 Testing posts access...');
      return fetch(`https://graph.facebook.com/${pageId}/posts?limit=3&access_token=${token}`);
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        console.log('❌ Posts Access FAILED:');
        console.log('  Error:', data.error.message);
        console.log('  Code:', data.error.code);
      } else {
        console.log('✅ Posts Access SUCCESS!');
        console.log('  Found', data.data?.length || 0, 'posts');
        console.log('\n🎉 THIS TOKEN WILL WORK FOR MAAD! 🎉');
      }
      rl.close();
    })
    .catch(error => {
      console.error('❌ Network error:', error.message);
      rl.close();
    });
});