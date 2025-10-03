// Simple Facebook Posting Tool for MAAD
import 'dotenv/config';

const PAGE_ID = process.env.VITE_FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;

async function postToFacebook(message) {
  if (!PAGE_ID || !ACCESS_TOKEN) {
    console.error('❌ Missing Facebook credentials in .env file');
    return;
  }

  console.log('📝 Posting to Facebook...');
  console.log('Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

  try {
    const response = await fetch(
      `https://graph.facebook.com/v20.0/${PAGE_ID}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          access_token: ACCESS_TOKEN
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('❌ Facebook API Error:', data.error.message);
      console.error('   Code:', data.error.code);
    } else {
      console.log('✅ SUCCESS! Post created!');
      console.log('   Post ID:', data.id);
      console.log('   View at: https://www.facebook.com/' + data.id);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Example usage
const exampleMessage = `🔧 MAAD Services Update! 

We're currently available for:
• House clearance & junk removal 🏠
• Handyman services 🔨
• Garden clearance 🌳
• Painting & decorating 🎨

Contact us for a FREE quote! 
Based in Belfast area.

#MAD #Handyman #Clearance #Belfast`;

// Uncomment the line below to post the example
// postToFacebook(exampleMessage);

// Or post a custom message by calling:
// postToFacebook("Your custom message here");

export { postToFacebook };