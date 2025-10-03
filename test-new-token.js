// Test the new Facebook token
const token = 'EAAIFQlajmvcBPsLLlZArqPZABBjZCmW7ErZAmWoDJybWppO5HOOIaF9qzlEU6F9W0Ff7AtToBaZAAmwZB0FFcTFRmVQq2De6MiGZC8PYp6IgZAWcuEhQBKuA28IOrZCWv9NZC59oDGIVIJXhUtnyVefh7GNdNIQB6qaA5TojngM6NEVPAt1bL9z4anghkVmfgW8uiYrmZAyLfWESAsRUCqMxrYf3qkkNoeHsdeSVSvq8V5WlEgLOwZDZD';
const pageId = '820172544505737';

console.log('🔍 Testing New Facebook Token...');
console.log('Token length:', token.length);

fetch(`https://graph.facebook.com/v20.0/${pageId}/feed?access_token=${token}&limit=3`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.log('❌ Error:', data.error.message, data.error.code);
    } else {
      console.log('✅ New token working!');
      console.log('Posts found:', data.data ? data.data.length : 0);
      if (data.data && data.data.length > 0) {
        console.log('Sample post:', data.data[0].message || data.data[0].story || 'No text');
      }
    }
  })
  .catch(err => console.log('❌ Network error:', err.message));