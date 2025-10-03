# MAAD App - AI Agent Instructions

## Project Overview
MAAD is a React/TypeScript chat application with Facebook job search integration. The app combines conversational AI capabilities with automated job discovery from Facebook pages.

## Architecture & Key Components

### Core Chat System
- **`useSendMessage.ts`**: Central messaging hook that detects job search commands and handles both regular chat and job search flows
- **`ConversationSelector.tsx`**: React component for conversation management
- **Command Detection**: Natural language job search commands like "search facebook jobs", "find jobs limit 50"

### Facebook Integration Layer
- **`searchFacebookJobs.ts`**: Main job search engine with keyword matching and scoring
- **`FacebookJobSearch.tsx`**: React UI component for job search interface
- **`jobSearchIntegration.js`**: Bridge between React components and search functionality

### Data Flow
1. User input → `useSendMessage` → Command detection
2. Job search commands → `searchFacebookJobs` → Facebook Graph API
3. Results → UI rendering with job scores and matched keywords
4. Regular messages → Standard conversation flow

## Development Patterns

### TypeScript Configuration
- Uses **strict mode** with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- Module system: `"nodenext"` with `"verbatimModuleSyntax": true`
- JSX: `"react-jsx"` for React 19
- **Always use optional chaining** and null checks due to strict typing

### Job Search Patterns
```typescript
// Job scoring uses weighted keywords (see searchFacebookJobs.ts lines 15-30)
const highWeightKeywords = ['hiring', 'job', 'position', 'vacancy'];
const mediumWeightKeywords = ['work', 'apply', 'candidate'];

// Command parsing in useSendMessage.ts
const jobSearchRegex = /(?:search|find).+(?:facebook|jobs?)/i;
```

### Error Handling
- Uses `react-toastify` for user notifications
- Graceful fallbacks: job search errors don't break chat flow
- Facebook API errors are caught and displayed as toast messages

## Environment Setup

### Required Credentials

**Facebook Integration:**
- **Page ID**: `820172544505737` (current project page)
- **Access Token**: `EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD`
- **Environment Variable**: Set via `VITE_FACEBOOK_*` prefixed variables
- **Permissions needed**: `pages_read_engagement`, `pages_show_list`

**LivePerson Integration:**
- **Account ID**: Set via `VITE_LIVEPERSON_ACCOUNT_ID`
- **Authentication**: Use `VITE_LIVEPERSON_TOKEN` or username/password
- **Domain**: Set via `VITE_LIVEPERSON_DOMAIN` (default: va-a.ac.liveperson.net)

⚠️ **Security Note**: Tokens shown for development reference only. In production, always use Vite environment variables (`VITE_*`) and never commit credentials to version control.

### Token Management
- **Token Expiration**: Facebook Page Access Tokens typically expire in 60 days
- **Renewal**: Generate new tokens via Facebook Developers → Graph API Explorer
- **Validation**: Test token validity with `GET /me?access_token=YOUR_TOKEN`
- **Scope Requirements**: Ensure `pages_read_engagement` and `pages_show_list` permissions

### Dependencies
- React 19.1.1 with TypeScript 5.9.2
- No build system currently configured (only basic npm scripts)
- No testing framework (tests echo error message)

## Key Files to Understand

### Primary Logic
- **`searchFacebookJobs.ts`**: Job detection algorithm, keyword matching, scoring (0-1 confidence)
- **`useSendMessage.ts`**: Command routing, handles both chat and job search flows
- **`matchJobKeywords.ts`**: Keyword extraction and scoring logic

### Integration Points
- **`FacebookJobSearch.tsx`**: UI component that wraps the search functionality
- **`generateReply.ts`**, **`postComments.ts`**: Chat response generation
- **`getConversation.ts`**, **`fetchConversation.ts`**: Conversation state management
- **`services/agentSDK.ts`**: LivePerson Agent SDK wrapper with mock implementation

### LivePerson Agent SDK Integration
- **Mock Implementation**: Currently uses mock SDK in `services/agentSDK.ts`
- **Real SDK Setup**: Replace `createAgentSDK()` with actual LivePerson SDK import
- **Environment Variables**: Use `VITE_LIVEPERSON_*` prefixed variables for configuration
- **SDK Interface**: Standardized interface for easy switching between mock and real SDK

## Development Workflow

### Building
- No build system configured - relies on TypeScript compilation
- Use `tsc` directly or configure build tools as needed
- **Recommendation**: Add build scripts for production deployment

### Testing
- No test framework currently set up
- **Recommendation**: Add Jest/Vitest for job search logic testing
- Test job keyword matching with various Facebook post formats

### Testing Examples
Common job search queries for MAAD (handyman/clearance service):
```typescript
// High-confidence job searches
"search facebook jobs score 0.7"  // Only strong matches
"find jobs limit 100"             // Maximum search scope

// Targeted searches for handyman work
"search facebook jobs"             // Default: 25 posts, 0.3 score
"find jobs score 0.4 limit 50"    // Medium confidence, broader scope

// Expected keywords that should match:
// - "looking for handyman", "need clearance", "quote for work"
// - "electrician needed", "plumber required", "junk removal"
// - "anyone recommend", "wee job", "shift some junk"
```

### Debugging Job Search
1. Check `matchJobKeywords()` output for keyword detection
2. Verify `minJobScore` threshold (default 0.3, adjustable 0-1)
3. Facebook API responses logged in browser console
4. Toast notifications show search success/failure
5. **Test API connectivity**: Use Graph API Explorer with your token first

## Common Tasks

### Adding New Job Keywords
Edit `searchFacebookJobs.ts` around lines 15-30:
```typescript
const highWeightKeywords = [...existing, 'new-keyword'];
```

### Modifying Search Commands
Update regex in `useSendMessage.ts`:
```typescript
const jobSearchRegex = /your-new-pattern/i;
```

### Facebook API Integration
- All API calls go through `searchFacebookJobs.ts`
- Rate limiting handled by Facebook
- Results include post ID, content, timestamp, permalink
- Job confidence score calculated from keyword density

### Chat Integration
The `useSendMessage` hook automatically:
1. Detects job search commands in user input
2. Extracts search parameters (limit, score threshold)
3. Executes search and formats results
4. Falls back to regular chat for non-job commands

## Facebook API Configurations & Limitations

### API Constraints
- **Rate Limits**: 200 calls per hour per user, 25,000 per app per hour
- **Post Limit**: Maximum 100 posts per API call (`limit` parameter)
- **Date Range**: Use `since` and `until` parameters (YYYY-MM-DD format)
- **API Version**: Currently using Graph API v20.0

### Common API Issues
- **Token Expiration**: Results in HTTP 400/401 errors
- **Permission Errors**: Check page permissions and token scope  
- **Empty Results**: Page may have no public posts or limited content
- **Network Timeouts**: Facebook API can be slow during peak hours

### Optimization Tips
- **Batch Processing**: Search in chunks if expecting many results
- **Caching**: Consider storing recent searches to reduce API calls
- **Error Handling**: Always check for `response.error` in Facebook responses
- **Monitoring**: Log API response times and success rates

## Known Limitations
- No automated testing
- Missing build/deployment pipeline  
- Facebook API rate limits apply (200/hour per user)
- Job detection relies on English keywords only
- No database persistence for search results
- Single page search only (no multi-page federation)
- No real-time updates (manual search trigger required)