# Facebook Job Search Integration

I've created a comprehensive Facebook job search system for your application. Here's how to use it:

## 🚀 Quick Start

### 1. Basic Job Search

```typescript
import { searchFacebookFeedForJobs } from './searchFacebookJobs';

const result = await searchFacebookFeedForJobs({
  pageId: "YOUR_PAGE_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  limit: 25,
  minJobScore: 0.3
});

console.log(`Found ${result.jobs.length} job posts!`);
```

### 2. Using with Your Current Chat Interface

Your `useSendMessage` hook now supports job search commands! Just type any of these:

- `"search facebook jobs"`
- `"find jobs on facebook"`
- `"search facebook feed for jobs limit 50"`
- `"find facebook jobs score 0.5"`

The hook will automatically detect these commands and search for jobs instead of sending a regular message.

## 📋 Integration with Your Components

### Update Your Component Props

Add Facebook credentials to your component that uses `useSendMessage`:

```tsx
function YourChatComponent() {
  const { sendMessage } = useSendMessage({
    inputValue,
    uploadedFiles,
    conversation,
    setInputValue,
    setUploadedFiles,
    setIsLoading,
    agentSDK,
    // Add these new props:
    facebookPageId: "YOUR_FACEBOOK_PAGE_ID",
    facebookAccessToken: "YOUR_FACEBOOK_ACCESS_TOKEN"
  });

  // Now users can type "search facebook jobs" in the chat!
}
```

### Environment Variables (Recommended)

Set these in your environment:

```bash
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_ACCESS_TOKEN=your_access_token_here
```

Then in your code:

```typescript
facebookPageId: process.env.FACEBOOK_PAGE_ID,
facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN
```

## 🔧 Available Search Options

### Search Commands You Can Type:

1. **Basic search**: `"search facebook jobs"`
2. **With limit**: `"search facebook jobs limit 50"`
3. **With score filter**: `"find jobs score 0.7"`
4. **Combined**: `"search facebook jobs limit 25 score 0.5"`

### Programmatic Options:

```typescript
{
  pageId: string,           // Required: Facebook Page ID
  accessToken: string,      // Required: Facebook Access Token
  limit?: number,           // Optional: 1-100 (default: 25)
  minJobScore?: number,     // Optional: 0-1 (default: 0.3)
  since?: string,           // Optional: Date string "YYYY-MM-DD"
  until?: string            // Optional: Date string "YYYY-MM-DD"
}
```

## 📊 What You Get Back

Each job post includes:

```typescript
{
  id: string,              // Facebook post ID
  message: string,         // Post content
  created_time: string,    // When posted
  permalink_url?: string,  // Link to post
  from?: {                 // Page info
    name: string,
    id: string
  },
  jobScore: number,        // 0-1 confidence score
  matchedKeywords: string[] // Detected job keywords
}
```

## 🎯 Job Detection

The system detects jobs by looking for:

### High-weight keywords:
- hiring, job, position, vacancy, career, employment

### Medium-weight keywords:
- work, apply, candidate, interview, salary, benefits

### Patterns:
- "now hiring", "looking for", "join our team"
- Salary mentions ($50/hour, $60k/year)
- Employment types (full-time, remote, contract)

## 💡 Usage Examples

### 1. High-Quality Jobs Only
```typescript
// Only jobs with 70%+ confidence
const result = await searchFacebookFeedForJobs({
  pageId: "123456789",
  accessToken: "your_token",
  minJobScore: 0.7
});
```

### 2. Recent Jobs
```typescript
// Jobs from last week
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const result = await searchFacebookFeedForJobs({
  pageId: "123456789", 
  accessToken: "your_token",
  since: lastWeek.toISOString().split('T')[0]
});
```

### 3. Large Search
```typescript
// Search through 100 posts (max allowed)
const result = await searchFacebookFeedForJobs({
  pageId: "123456789",
  accessToken: "your_token", 
  limit: 100,
  minJobScore: 0.1  // Lower threshold for broader search
});
```

## 🔑 Getting Facebook Credentials

### Page ID:
1. Go to your Facebook page
2. Click "About" → "Page Info"
3. Copy the Page ID

### Access Token:
1. Go to Facebook Developers → Graph API Explorer
2. Select your app and page
3. Add permissions: `pages_read_engagement`, `pages_show_list`
4. Generate token

## 🎨 Chat Interface Integration

The updated `useSendMessage` hook will:

1. **Detect job search commands** in user input
2. **Execute the search** automatically
3. **Display results** in the chat as an assistant message
4. **Show success/error notifications** using toast
5. **Fall back to regular messaging** for non-job-search commands

### Example Chat Flow:

**User types**: `"search facebook jobs limit 30"`

**System responds**: 
```
🔍 Facebook Job Search Results

✅ Found 8 job posts out of 30 total posts:

**1. Tech Company** (85.2% job match)
📅 12/20/2024
🔑 Keywords: hiring, software, developer, remote
📝 "We're hiring a Senior Software Developer for our remote team..."
🔗 [View Post](https://facebook.com/...)

**2. Marketing Agency** (72.1% job match)
📅 12/19/2024  
🔑 Keywords: position, marketing, full-time
📝 "Open position for Marketing Coordinator. Full-time role..."

---

📄 More results available. Increase limit to see more posts.
```

This integration makes it super easy for users to search for jobs right from your chat interface! 🎉