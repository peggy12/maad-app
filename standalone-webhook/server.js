const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Facebook credentials
const FACEBOOK_PAGE_ACCESS_TOKEN = 'EAAIFQlajmvcBPk4VYh0ykCKydD91Ue8gseFEKhxUI6s5DRayI0HobApn4mrFfvKzSNDlpUwjVKe06xvEuz5qWo2ADX7VsAeWzjkPLZByv6gc6lxVFZCmQ5UZBh49MFGZArRixRfPokfftEyt0cQBfmvsLP6ulc4HlMYoHZBqQgk4UG02FU7TdZAyU4LyljRnRu5CAlNoHIZCcrMCc8g5T89YFsn44ZD';
const FACEBOOK_PAGE_ID = '820172544505737';

// Base44 configuration
const BASE44_CONFIG = {
    baseUrl: 'https://manaboutadog.base44.app',
    agentName: 'MAAD',
    apiKey: 'd4c9f08499e944ef99621b19d45e9df3'
};

// Enable JSON parsing and CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Function to process job posts and respond with MAAD
async function processJobPost(post) {
    try {
        console.log('🤖 Processing job post with MAAD agent: - server.js:27', post.post_id);
        
        // Check if this looks like a job post
        const jobKeywords = ['job', 'hiring', 'work', 'position', 'vacancy', 'apply', 'candidate', 'looking for', 'need', 'required'];
        const hasJobKeywords = jobKeywords.some(keyword => 
            post.message.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (hasJobKeywords) {
            console.log('✅ Job keywords detected, generating MAAD response - server.js:36');
            
            // Generate response using Base44 MAAD agent
            const maadResponse = await generateMaadResponse(post.message);
            
            if (maadResponse) {
                // Post comment to Facebook
                await postFacebookComment(post.post_id, maadResponse);
                console.log('📝 MAAD responded to job post: - server.js:44', post.post_id);
            }
        } else {
            console.log('ℹ️  No job keywords detected, skipping response - server.js:47');
        }
    } catch (error) {
        console.error('❌ Error processing job post: - server.js:50', error);
    }
}

// Function to generate response using Base44 MAAD agent
async function generateMaadResponse(jobMessage) {
    try {
        console.log('🤖 Calling Base44 AI for dynamic response... - server.js:57');
        
        // Call Base44 AI API for intelligent response
        const base44Response = await callBase44AI(jobMessage);
        
        if (base44Response) {
            console.log('🤖 Base44 AI generated response: - server.js:63', base44Response.substring(0, 100) + '...');
            return base44Response;
        } else {
            // Fallback to static response if Base44 fails
            console.log('⚠️ Base44 AI failed, using fallback response - server.js:67');
            const fallbackResponse = `Hi! I'm MAAD (Man About A Dog) 🐕 I saw your post about work opportunities. I provide handyman services, clearance work, and general maintenance. If you need reliable help with any odd jobs, repairs, or clearance work, feel free to get in touch! Available for quotes and quick response times.`;
            return fallbackResponse;
        }
    } catch (error) {
        console.error('❌ Error generating MAAD response: - server.js:72', error);
        // Return fallback response on error
        return `Hi! I'm MAAD (Man About A Dog) 🐕 I provide handyman services, clearance work, and general maintenance. Contact me for reliable help with odd jobs, repairs, or clearance work!`;
    }
}

// Function to call Base44 AI API
async function callBase44AI(jobMessage) {
    try {
        const fetch = (await import('node-fetch')).default;
        
        // Prepare the prompt for Base44 AI
        const prompt = `You are MAAD (Man About A Dog), a friendly handyman and clearance service provider. Someone posted this job-related message on Facebook: "${jobMessage}"

Please respond as MAAD with:
- A friendly, professional tone
- Mention your handyman and clearance services
- Show interest in helping with their specific needs
- Keep it conversational and under 200 characters
- Include a dog emoji 🐕
- Don't be overly salesy, be helpful

Your response:`;

        console.log('📡 Sending request to Base44 AI... - server.js:96');
        
        const response = await fetch(`${BASE44_CONFIG.baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BASE44_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                message: prompt,
                agent: BASE44_CONFIG.agentName,
                conversationId: `facebook-job-${Date.now()}`
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Base44 AI response received - server.js:113');
            
            // Extract the AI response
            const aiResponse = result.response || result.message || result.reply;
            
            if (aiResponse) {
                // Clean up the response (remove quotes, trim, etc.)
                return aiResponse.replace(/^["']|["']$/g, '').trim();
            }
        } else {
            console.error('❌ Base44 AI API error: - server.js:123', response.status, response.statusText);
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error calling Base44 AI: - server.js:128', error);
        return null;
    }
}

// Function to post comment to Facebook
async function postFacebookComment(postId, comment) {
    try {
        const fetch = (await import('node-fetch')).default;
        
        const url = `https://graph.facebook.com/v20.0/${postId}/comments`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: comment,
                access_token: FACEBOOK_PAGE_ACCESS_TOKEN
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Facebook comment posted successfully: - server.js:153', result.id);
            return result;
        } else {
            console.error('❌ Failed to post Facebook comment: - server.js:156', result);
            return null;
        }
    } catch (error) {
        console.error('❌ Error posting Facebook comment: - server.js:160', error);
        return null;
    }
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'MAAD Webhook Server is running!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /webhook - Facebook webhook verification',
            'POST /webhook - Facebook webhook events'
        ]
    });
});

// Facebook Webhook Verification (GET)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('🔍 Webhook verification request: - server.js:183', { 
        mode, 
        token: token ? 'present' : 'missing', 
        challenge: challenge ? 'present' : 'missing' 
    });
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === 'maadlad_verify_token') {
        console.log('✅ Webhook verified successfully! - server.js:191');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Webhook verification failed  mode: - server.js:194', mode, 'token match:', token === 'maadlad_verify_token');
        res.status(403).json({ error: 'Forbidden - verification failed' });
    }
});

// Facebook Webhook Events (POST)
app.post('/webhook', (req, res) => {
    console.log('📢 Webhook event received at: - server.js:201', new Date().toISOString());
    console.log('📝 Event data: - server.js:202', JSON.stringify(req.body, null, 2));
    
    const body = req.body;
    
    // Verify this is a page subscription
    if (body.object === 'page') {
        console.log('✅ Page subscription event confirmed - server.js:208');
        
        // Process each entry
        body.entry?.forEach((entry) => {
            console.log('📄 Processing entry: - server.js:212', entry.id);
            
            entry.changes?.forEach((change) => {
                if (change.field === 'feed') {
                    const post = change.value;
                    console.log('🔍 Feed change detected: - server.js:217', {
                        postId: post.post_id,
                        message: post.message ? post.message.substring(0, 100) + '...' : 'No message',
                        createdTime: post.created_time
                    });
                    
                    // Process job post with MAAD agent
                    if (post.message) {
                        console.log('📝 New post content: - server.js:225', post.message);
                        
                        // Call MAAD agent and respond
                        processJobPost(post);
                    }
                }
            });
        });
        
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log('❌ Not a page subscription event: - server.js:236', body.object);
        res.status(404).json({ error: 'Not a page subscription' });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('💥 Server error: - server.js:243', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`🚀 MAAD Webhook server listening on port ${port} - server.js:248`);
    console.log(`📍 Health check: http://localhost:${port}/ - server.js:249`);
    console.log(`🔗 Webhook endpoint: http://localhost:${port}/webhook - server.js:250`);
    console.log(`🔑 Verify token: maadlad_verify_token - server.js:251`);
});