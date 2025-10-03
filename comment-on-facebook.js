// Comment on Facebook Posts Tool
import 'dotenv/config';
import { postFacebookComment } from './postFacebookComment.js';

const ACCESS_TOKEN = process.env.VITE_FACEBOOK_ACCESS_TOKEN;

async function commentOnPost(postId, message) {
  if (!ACCESS_TOKEN) {
    console.error('❌ Missing Facebook access token in .env file');
    return;
  }

  console.log('💬 Adding comment to post...');
  console.log('Post ID:', postId);
  console.log('Comment:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

  try {
    const commentId = await postFacebookComment(postId, message, ACCESS_TOKEN);
    
    if (commentId) {
      console.log('✅ SUCCESS! Comment posted!');
      console.log('   Comment ID:', commentId);
    } else {
      console.log('❌ Failed to post comment');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example: Comment on one of the posts we just created
const examplePostId = '820172544505737_122103150783044499'; // First test post
const exampleComment = '👋 Hi! MAAD here - we specialize in handyman work and can provide a free quote! Contact us anytime! 🔧';

// Uncomment to test commenting:
// commentOnPost(examplePostId, exampleComment);

export { commentOnPost };