// Quick Facebook API test
const pageId = '820172544505737';
const appId = '568732432964343';
const token = 'EAAIFQlajmvcBPjc0q9nnl521aZA8hPkI3Jt0hD3ZA9ZASHbU6YTGHXuWzdTW7Fsa4VkbokFAgaLacO7DrL1rKWe47DkyFrQJ0dSqwmM2DgZB25FaMHhNEaLiNczcQn9CBFW4ygcZCdxV92UGwuSoto4ZCZAqGZCEuoXI9drz6ZB8jBMB0P2MCKFUZCXS0Jxz40Rj2JRkhJRzvZAgvllpH8cWooUAHrZCKrfb8IlcxbBdzswHWygZB9AZDZD';

console.log('🔍 Testing Facebook App Configuration...');
console.log('App ID:', appId);
console.log('Page ID:', pageId);

fetch(`https://graph.facebook.com/v20.0/${pageId}/feed?access_token=${token}&limit=5`)
  .then(r => r.json())
  .then(data => {
    console.log('✅ Facebook API Test Results:');
    console.log('Posts found:', data.data ? data.data.length : 'Error');
    if (data.error) {
      console.log('❌ Error:', data.error.message, data.error.code);
    } else {
      console.log('✅ Facebook integration working!');
      if (data.data && data.data.length > 0) {
        console.log('Sample post:', data.data[0].message || data.data[0].story || 'No text content');
      }
    }
  })
  .catch(err => console.log('❌ Network error:', err.message));