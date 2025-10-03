// Get the complete Page Access Token
const USER_TOKEN = 'EAAIFQlajmvcBPs8ZAt2dVqqpzYd2pNnopfRxXtWBvPaZAuxZBTaQZBTJkVwAaVZAPNNZAcgB1gDPHYeOnZCHzQH4CrnWGYnDvHjWhUaJRUvOd1lpUzxEqZCe9GJ6VAgsa0hnckqjxs61vvoF7zBxrFZB5V12UPsMVlb80ePYAH7awXOp2OFQVdkah5uDWdN1taGuF';

console.log('🔍 Getting Complete Page Access Token...');

fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${USER_TOKEN}`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ Error:', data.error.message);
      return;
    }
    
    const targetPage = data.data.find(page => page.id === '820172544505737');
    if (targetPage) {
      console.log('✅ Found target page:', targetPage.name);
      console.log('📋 COMPLETE TOKEN:');
      console.log(targetPage.access_token);
      console.log('');
      console.log('Token length:', targetPage.access_token.length);
      
      // Test the token immediately
      return fetch(`https://graph.facebook.com/v20.0/820172544505737/feed?access_token=${targetPage.access_token}&limit=1`);
    } else {
      console.log('❌ Target page not found');
    }
  })
  .then(r => r ? r.json() : null)
  .then(data => {
    if (data) {
      if (data.error) {
        console.log('❌ Token test failed:', data.error.message);
      } else {
        console.log('✅ Token test successful! Posts found:', data.data ? data.data.length : 0);
      }
    }
  })
  .catch(err => console.log('❌ Error:', err.message));