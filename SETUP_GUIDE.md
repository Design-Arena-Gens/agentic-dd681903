# LinkedIn AI Auto Poster - Setup Guide

## Live Application

**URL**: https://agentic-dd681903.vercel.app

## What This Does

Automatically generates and posts daily LinkedIn content about AI topics using Google Gemini API:
- ✨ AI-generated engaging posts about AI trends
- 🎨 Relevant images for each post
- 🧪 Manual testing via web interface
- ⏰ Can be scheduled with external cron services

## Required Setup

### 1. Get Google Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

### 2. Get LinkedIn Access Token & Person URN

#### Create LinkedIn App
1. Go to: https://www.linkedin.com/developers/apps
2. Click "Create app"
3. Fill in required details
4. Add "Sign In with LinkedIn" and "Share on LinkedIn" products
5. In "Auth" tab, note your Client ID and Client Secret

#### Get Access Token (OAuth 2.0)
You need to implement OAuth flow or use this quick method:

**Authorization URL**:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=w_member_social%20r_liteprofile
```

Replace:
- `YOUR_CLIENT_ID` - from LinkedIn app
- `YOUR_REDIRECT_URI` - any URL (e.g., http://localhost:3000/callback)

After authorization, you'll get a `code` parameter in redirect URL.

**Exchange code for token**:
```bash
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code' \
  -d 'code=YOUR_AUTH_CODE' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'redirect_uri=YOUR_REDIRECT_URI'
```

Save the `access_token` from response.

#### Get Person URN
```bash
curl -X GET 'https://api.linkedin.com/v2/me' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
```

From response, take the `id` field and format as: `urn:li:person:YOUR_ID`

### 3. Configure Vercel Environment Variables

1. Go to: https://vercel.com/arcada-agentic-models/agentic-dd681903/settings/environment-variables
2. Add these variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `GEMINI_API_KEY` | Your Gemini API key | From Google AI Studio |
| `LINKEDIN_ACCESS_TOKEN` | Your LinkedIn token | From OAuth flow |
| `LINKEDIN_PERSON_URN` | urn:li:person:YOUR_ID | Your LinkedIn person URN |
| `CRON_SECRET` | Any random string (optional) | For securing cron endpoint |

3. Click "Save" for each variable
4. Redeploy (Vercel should auto-redeploy)

## Usage

### Web Interface
1. Visit: https://agentic-dd681903.vercel.app
2. Click "Create Post Now" to test
3. View generated content and verify it posts to LinkedIn

### Manual API Call
```bash
# With cron secret
curl -X POST https://agentic-dd681903.vercel.app/api/manual-post

# Direct cron endpoint (if CRON_SECRET is set)
curl -X GET https://agentic-dd681903.vercel.app/api/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Automated Daily Posts

Since Vercel cron limit was reached, use external cron services:

#### Option 1: EasyCron (Free)
1. Sign up: https://www.easycron.com/
2. Create new cron job
3. URL: `https://agentic-dd681903.vercel.app/api/cron`
4. Method: GET
5. Add header: `Authorization: Bearer YOUR_CRON_SECRET`
6. Schedule: `0 9 * * *` (9 AM daily)

#### Option 2: cron-job.org (Free)
1. Sign up: https://cron-job.org/
2. Create new job
3. URL: `https://agentic-dd681903.vercel.app/api/cron`
4. Schedule: Daily at 9:00 AM
5. Add custom header: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option 3: GitHub Actions (Free)
Create `.github/workflows/linkedin-post.yml`:

```yaml
name: Daily LinkedIn Post

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger LinkedIn Post
        run: |
          curl -X GET https://agentic-dd681903.vercel.app/api/cron \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub repository secrets.

## Troubleshooting

### "Missing environment variables"
- Check all variables are set in Vercel dashboard
- Redeploy after adding variables

### LinkedIn API Error
- Verify access token hasn't expired (LinkedIn tokens last 60 days)
- Check Person URN format: `urn:li:person:XXXXXXXXX`
- Ensure app has correct permissions

### Image Upload Fails
- Currently using placeholder images
- Post will still succeed without image
- For real images, integrate Imagen API or DALL-E

### Testing Locally
```bash
# Create .env file
GEMINI_API_KEY=your_key
LINKEDIN_ACCESS_TOKEN=your_token
LINKEDIN_PERSON_URN=urn:li:person:your_id
CRON_SECRET=test_secret

# Install and run
npm install
npm run dev

# Test at http://localhost:3000
```

## Architecture

- **Framework**: Next.js 14 App Router
- **Deployment**: Vercel
- **AI**: Google Gemini API
- **API**: LinkedIn API v2
- **Scheduling**: External cron services

## API Endpoints

- `GET /api/cron` - Generate and post (protected by CRON_SECRET)
- `POST /api/manual-post` - Trigger post from UI
- `/` - Web interface

## Customization

### Change Post Style
Edit `app/api/cron/route.ts` around line 11:
```typescript
const prompt = `Generate an engaging LinkedIn post about...`;
```

### Change Posting Time
Update your external cron schedule (examples above use 9 AM UTC)

### Add Real Image Generation
Replace `generatePlaceholderImage()` function with:
- Google Imagen API
- DALL-E API
- Stable Diffusion API

## Security Notes

- Never commit `.env` files
- Rotate LinkedIn tokens regularly
- Use CRON_SECRET to protect endpoint
- Monitor API usage quotas

## Support

For issues or questions, check:
- LinkedIn API docs: https://docs.microsoft.com/en-us/linkedin/
- Google Gemini docs: https://ai.google.dev/docs
- Vercel docs: https://vercel.com/docs

Enjoy your automated LinkedIn presence! 🚀
