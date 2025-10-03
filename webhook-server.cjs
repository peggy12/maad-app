
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs").promises;
const path = require("path");

const app = express();

// Configuration
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "maadlad_verify_token";
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || "your_app_secret_here";
const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || "EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD";
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "820172544505737";

// Enhanced security middleware
const verifyRequestSignature = (req, res, next) => {
  const signature = req.get("x-hub-signature-256");
  const body = req.body;

  if (!signature) {
    console.warn("⚠️ Missing signature - webhook-server.js:22");
    return res.sendStatus(401);
  }

  const expectedSignature = crypto
    .createHmac("sha256", APP_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  const expectedHash = `sha256=${expectedSignature}`;

  if (signature !== expectedHash) {
    console.error("❌ Invalid signature - webhook-server.js:34");
    return res.sendStatus(401);
  }

  next();
};

// Middleware
app.use(bodyParser.json({ verify: (req, res, buf) => {
  req.rawBody = buf;
}}));

// Rate limiting storage (in-memory for demo, use Redis in production)
const rateLimiter = new Map();

const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const clientData = rateLimiter.get(ip);
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
  } else {
    clientData.count++;
  }

  if (clientData.count > maxRequests) {
    return res.status(429).json({ error: "Too many requests" });
  }

  next();
};

app.use(rateLimit);

// Job processing functions
const { analyzeJobPost } = require('./matchJobKeywords.cjs');

async function processJobPost(postData) {
  try {
    const message = postData.message || '';
    const analysis = analyzeJobPost(message);
    
    if (analysis.isJob && analysis.confidence > 0.4) {
      console.log(`🎯 Job opportunity detected: ${analysis.confidence} confidence - webhook-server.js:86`);
      
      // Log job to file for tracking
      const jobLog = {
        timestamp: new Date().toISOString(),
        postId: postData.id,
        message: message.substring(0, 200),
        confidence: analysis.confidence,
        category: analysis.category,
        keywords: analysis.matchedKeywords,
        hasLocation: analysis.hasLocation,
        locationMatches: analysis.locationMatches
      };
      
      await logJob(jobLog);
      
      // Auto-respond if high confidence
      if (analysis.confidence > 0.7) {
        await postResponse(postData.id, analysis);
      }
      
      return jobLog;
    }
  } catch (error) {
    console.error('Job processing error: - webhook-server.js:110', error);
  }
  return null;
}

async function logJob(jobData) {
  try {
    const logsDir = path.join(__dirname, 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `jobs-${today}.json`);
    
    let logs = [];
    try {
      const existingData = await fs.readFile(logFile, 'utf8');
      logs = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist, start with empty array
    }
    
    logs.push(jobData);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    
    console.log(`📝 Job logged to ${logFile} - webhook-server.js:134`);
  } catch (error) {
    console.error('Logging error: - webhook-server.js:136', error);
  }
}

async function postResponse(postId, analysis) {
  try {
    // Generate response based on job analysis
    let response = "Hi! MAAD here 👋 ";
    
    if (analysis.category === 'clearance') {
      response += "We specialize in house clearance and junk removal. Would love to provide a free quote!";
    } else if (analysis.category === 'handyman') {
      response += "We handle all types of handyman work. Happy to discuss your requirements and provide a quote!";
    } else {
      response += "We offer clearance and handyman services. Feel free to message us for a free quote!";
    }
    
    response += " 📞 Contact us anytime!";
    
    // Post comment (you'd implement Facebook API call here)
    console.log(`🤖 Would respond to post ${postId}: ${response} - webhook-server.js:156`);
    
    // In production, make actual Facebook API call:
    // await fetch(`https://graph.facebook.com/v18.0/${postId}/comments`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     message: response,
    //     access_token: PAGE_ACCESS_TOKEN
    //   })
    // });
    
  } catch (error) {
    console.error('Response posting error: - webhook-server.js:169', error);
  }
}

// Verification endpoint
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified - webhook-server.js:180");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook verification failed - webhook-server.js:183");
    res.sendStatus(403);
  }
});

// Enhanced event receiver with security and job processing
app.post("/webhook", verifyRequestSignature, async (req, res) => {
  const body = req.body;
  
  console.log("📨 Incoming webhook: - webhook-server.js:192", JSON.stringify(body, null, 2));

  if (body.object === "page") {
    // Process each entry
    for (const entry of body.entry || []) {
      // Process feed changes (new posts, comments, etc.)
      for (const change of entry.changes || []) {
        if (change.field === "feed") {
          const postData = change.value;
          
          console.log(`📊 Feed change: ${change.value.verb} on post ${postData.post_id || postData.id} - webhook-server.js:202`);
          
          // Process potential job posts
          if (postData.message) {
            const jobResult = await processJobPost(postData);
            if (jobResult) {
              console.log(`✅ Job processed: ${jobResult.confidence} confidence - webhook-server.js:208`);
            }
          }
        }
      }
      
      // Process messages (for direct messages)
      for (const messaging of entry.messaging || []) {
        if (messaging.message) {
          console.log("💬 Direct message received: - webhook-server.js:217", messaging.message.text);
          // Handle direct messages here
        }
      }
    }
    
    res.status(200).send("EVENT_RECEIVED");
  } else {
    console.log("❓ Unknown webhook object: - webhook-server.js:225", body.object);
    res.sendStatus(404);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "2.0.0"
  });
});

// Job logs endpoint (for monitoring)
app.get("/logs/jobs", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const logFile = path.join(__dirname, 'logs', `jobs-${date}.json`);
    
    try {
      const data = await fs.readFile(logFile, 'utf8');
      const jobs = JSON.parse(data);
      res.json({
        date,
        count: jobs.length,
        jobs: jobs.slice(0, 50) // Limit to 50 most recent
      });
    } catch (error) {
      res.json({ date, count: 0, jobs: [], message: "No jobs found for this date" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve job logs" });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error("🔥 Server error: - webhook-server.js:264", error);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
  console.log(`🚀 Enhanced MAAD Webhook Server running on port ${PORT} - webhook-server.js:270`);
  console.log(`📋 Health check: http://localhost:${PORT}/health - webhook-server.js:271`);
  console.log(`📊 Job logs: http://localhost:${PORT}/logs/jobs - webhook-server.js:272`);
  console.log(`🔐 Security: Signature verification ${APP_SECRET ? 'ENABLED' : 'DISABLED'} - webhook-server.js:273`);
});