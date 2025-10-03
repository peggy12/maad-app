# 🎯 MAAD App - User Guide (Production Mode)

## Quick Start - 3 Simple Steps

### 1️⃣ Start Your Servers

Open **3 PowerShell terminals** and run these commands:

**Terminal 1 - Webhook Server:**
```powershell
cd C:\Users\gregm\MAAD-app
npm run webhook
```
✅ You should see: "🚀 Enhanced MAAD Webhook Server running on port 1337"

**Terminal 2 - React App:**
```powershell
cd C:\Users\gregm\MAAD-app
npm run dev
```
✅ You should see: "VITE ready at http://localhost:3000/"

**Terminal 3 - Public Tunnel:**
```powershell
cd C:\Users\gregm\MAAD-app
npx localtunnel --port 1337
```
✅ You should see: "your url is: https://xxxxx.loca.lt"

### 2️⃣ Open Your App

Visit **http://localhost:3000/** in your browser

You'll see the MAAD app interface with:
- Chat input box
- Facebook Job Search panel
- Conversation selector
- Base44 AI Demo

### 3️⃣ Search for Jobs on Facebook

## 🔍 **How to Search for Jobs**

### **Basic Job Search Commands:**

Type these commands in the chat box:

```
search facebook jobs
```
- Searches your Facebook page feed for job posts
- Uses default settings (25 posts, 0.3 confidence threshold)

```
find jobs limit 50
```
- Searches up to 50 recent posts
- Finds more jobs but takes a bit longer

```
search jobs score 0.7
```
- Only shows high-confidence jobs (0.7 or higher)
- Reduces false positives

### **Advanced Search Commands:**

```
find handyman jobs in belfast
```
- Searches for handyman-specific jobs
- Filters by Belfast location

```
search clearance jobs limit 100 score 0.5
```
- Custom limit (100 posts)
- Medium confidence threshold (0.5)
- Focuses on clearance jobs

```
find jobs since 2025-01-01
```
- Searches posts since January 1st, 2025
- Useful for catching up on missed opportunities

## 📊 **Understanding the Results**

When you search, you'll see results like:

```
Found 12 potential jobs!

🏠 Handyman Job (0.95 confidence)
"Looking for reliable handyman in Belfast to fix kitchen..."
📍 Belfast
🔑 Keywords: handyman, fix, reliable, belfast, work
🔗 View Post: [Facebook Link]
```

**What the scores mean:**
- **0.8-1.0**: Very likely a real job (HIGH confidence)
- **0.5-0.8**: Probably a job (MEDIUM confidence)
- **0.3-0.5**: Maybe a job (LOW confidence)
- **Below 0.3**: Not shown (filtered out)

## 💬 **How to Use the Chat Features**

### **Regular Chat:**
Just type normal messages to have a conversation:
```
Hello, how are you?
Can you help me find work?
What services do you offer?
```

### **Job Search:**
Any message containing "search" or "find" + "facebook" or "jobs":
```
✅ "search facebook jobs"
✅ "find me some jobs"
✅ "look for facebook opportunities"
✅ "search for handyman work"
```

### **View Conversations:**
The conversation selector shows recent chat history and Facebook interactions.

## 🤖 **Automated Features (Once Facebook is Connected)**

### **Automatic Job Detection:**
When connected to Facebook webhooks, the system will:
1. Monitor your Facebook page feed in real-time
2. Automatically detect new job posts
3. Score them based on keywords and confidence
4. Log them to `/logs/jobs`
5. Optionally auto-respond (if enabled)

### **Auto-Response:**
The system can automatically reply to job posts with:
- **Handyman jobs**: Specialized handyman response
- **Clearance jobs**: House clearance service response
- **Trade jobs**: General trades response
- **Other jobs**: General MAAD services response

**Note**: Auto-response is currently in test mode. Enable in production after testing.

## 🔧 **Facebook Integration Setup**

To connect your app to Facebook for automatic job detection:

### **Step 1: Get Your Tunnel URL**
From Terminal 3, copy the URL that looks like:
```
https://xxxxx.loca.lt
```

### **Step 2: Configure Facebook Webhook**
1. Go to: https://developers.facebook.com
2. Select your app
3. Navigate to: **Messenger** → **Settings**
4. Click: **Add Callback URL**
5. Enter:
   - **Callback URL**: `https://xxxxx.loca.lt/webhook`
   - **Verify Token**: `maadlad_verify_token`
6. Click: **Verify and Save**

### **Step 3: Subscribe to Events**
Select these webhook fields:
- ✅ `feed` - Page feed updates (for job detection)
- ✅ `messages` - Direct messages
- ✅ `messaging_postbacks` - Button clicks

### **Step 4: Test Connection**
Once configured, Facebook will start sending job posts to your webhook server automatically!

## 📈 **Monitoring Your System**

### **Check Webhook Health:**
Visit: `https://xxxxx.loca.lt/health`

Should show:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### **View Job Logs:**
Visit: `https://xxxxx.loca.lt/logs/jobs`

Shows all detected jobs with:
- Timestamp
- Post content
- Confidence score
- Matched keywords
- Location data

### **Check React App:**
Open browser console (F12) to see:
- API requests
- Job search results
- Error messages (if any)

## 🎨 **Using the UI Features**

### **Navigation Tabs:**
- **💬 Chat & Search**: Main interface for job searching
- **📊 Analytics**: View statistics (when logged in)
- **👤 Profile**: User profile and settings (when logged in)

### **Authentication:**
Currently in demo mode with mock authentication. Login with any credentials to test.

### **File Uploads:**
You can attach images or documents to chat messages (feature in development).

## ⚠️ **Important Notes**

### **Keep Servers Running:**
All 3 terminals must stay open:
- Close any = system stops working
- Restart if needed using the same commands

### **Tunnel URL Changes:**
The localtunnel URL changes every restart. If you restart Terminal 3:
1. Copy the new URL
2. Update Facebook webhook settings
3. Test the connection

### **Token Expiration:**
Your Facebook access token expires in ~60 days. When it expires:
1. Get a new token from Facebook Graph API Explorer
2. Update `.env` file
3. Restart webhook server

## 🚨 **Troubleshooting**

### **No Jobs Found:**
- Check if your Facebook page has recent posts
- Lower confidence threshold: `search jobs score 0.2`
- Increase limit: `find jobs limit 100`
- Check your access token is valid

### **Webhook Not Working:**
- Verify tunnel is running (Terminal 3)
- Test health endpoint: `https://xxxxx.loca.lt/health`
- Check Facebook webhook settings
- Verify token matches: `maadlad_verify_token`

### **React App Errors:**
- Check browser console (F12)
- Restart dev server (Terminal 2)
- Clear browser cache
- Check `.env` file has correct variables

### **Connection Errors:**
- Verify all 3 servers are running
- Check firewall isn't blocking ports 1337 or 3000
- Try restarting all terminals

## 🎯 **Daily Workflow**

### **Morning Routine:**
1. Start all 3 servers
2. Open http://localhost:3000/
3. Run: `search facebook jobs limit 50`
4. Review high-confidence jobs
5. Respond to promising opportunities

### **During the Day:**
- Monitor webhook logs for new jobs
- Check `/logs/jobs` periodically
- Respond to detected opportunities

### **Evening Routine:**
- Review day's job discoveries
- Check analytics for success rate
- Adjust search parameters if needed

## 🚀 **Next Steps**

### **For Daily Use:**
Just keep the 3 terminals running and use the search commands!

### **For Production:**
Deploy to a cloud platform (Vercel, Railway, Heroku) so you don't need to keep your computer on 24/7.

See: `PRODUCTION_DEPLOYMENT.md` for deployment instructions.

---

**You're all set! Start searching for jobs with: `search facebook jobs`** 🎉