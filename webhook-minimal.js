const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// Facebook Webhook Verification
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    console.log('Webhook verification request:', { mode, token, challenge });
    
    // Check if mode and token are correct
    if (mode === 'subscribe' && token === 'maad_verify_2025') {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        console.log('Webhook verification failed');
        res.sendStatus(403);
    }
});

// Facebook Webhook Events
app.post('/webhook', (req, res) => {
    console.log('Webhook event received:', JSON.stringify(req.body, null, 2));
    
    // Always respond with 200 OK
    res.status(200).send('EVENT_RECEIVED');
});

// Health check endpoint
app.get('/', (req, res) => {
    res.send('MAAD Webhook Server is running!');
});

app.listen(port, () => {
    console.log(`Webhook server listening on port ${port}`);
});