# 🔧 Fix "Application Deleted" Error

## The Problem
Your Facebook access token is from a deleted Facebook App. We need to create a new app or get a token from an active app.

## Solution: Create a New Facebook App

### Step 1: Create Facebook App

1. Go to: **https://developers.facebook.com/apps/**
2. Click **"Create App"**
3. Select **"Business"** type
4. Fill in:
   - **App Name**: "MAAD Job Finder" (or your choice)
   - **Contact Email**: Your email
5. Click **"Create App"**

### Step 2: Add Facebook Login Product

1. In your new app dashboard
2. Click **"Add Products"** 
3. Find **"Facebook Login"** → Click **"Set Up"**
4. Select **"Web"** platform
5. Enter: `http://localhost:3000` as site URL

### Step 3: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy:
   - **App ID**: `_________________`
   - **App Secret**: Click "Show" and copy `_________________`

### Step 4: Get NEW Access Token

1. Go to: **https://developers.facebook.com/tools/explorer/**
2. At top, select **YOUR NEW APP** from dropdown
3. Click **"Get Token"** → **"Get Page Access Token"**
4. Select your page (ID: 61555264737981)
5. Grant permissions:
   - ✅ pages_read_engagement
   - ✅ pages_show_list
   - ✅ pages_manage_posts
6. **Copy the NEW token** (starts with "EAA...")

### Step 5: Paste Your NEW Credentials Here

Once you have them, provide:

1. **NEW App ID**: `_________________`
2. **NEW App Secret**: `_________________`
3. **NEW Access Token**: `_________________`

And I'll update everything!

---

## Alternative: Use Existing Facebook App

If you have another active Facebook app:

1. Go to: **https://developers.facebook.com/apps/**
2. Click on your active app
3. Follow Step 4 above to get a new token
4. Paste the new token here

---

## Quick Test Without App (Temporary)

If you want to test quickly without creating an app:

1. Go to: **https://developers.facebook.com/tools/explorer/**
2. Use the **"Graph API Explorer"** default app
3. Get a short-lived token (expires in 1-2 hours)
4. Use it for testing

This won't work for production but good for testing!

---

**What would you like to do?**
- Create a new Facebook app (recommended)
- Use an existing app
- Quick test with temporary token