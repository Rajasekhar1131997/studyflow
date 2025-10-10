# StudyFlow - Vercel Deployment Guide 🚀

Complete guide to deploy your StudyFlow app to Vercel.

## Prerequisites ✅

Before deploying, ensure you have:
- [x] Supabase project created
- [x] Database table created (run `database-schema.sql`)
- [x] NVIDIA API key obtained
- [x] GitHub account
- [x] Vercel account (free tier is fine)

## Step 1: Prepare for Deployment

### 1.1 Initialize Git Repository

```bash
cd studyflow
git init
git add .
git commit -m "Initial commit: StudyFlow AI Study Assistant"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `studyflow`
3. Description: "AI-powered study assistant with NVIDIA Nemotron"
4. Public or Private (your choice)
5. Don't initialize with README
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/studyflow.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Go to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Hobby" (free tier)
4. Connect your GitHub account

### 2.2 Import Project

1. Click "Add New..." → "Project"
2. Find your `studyflow` repository
3. Click "Import"

### 2.3 Configure Project

Vercel will auto-detect Next.js settings:
- Framework Preset: **Next.js**
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### 2.4 Add Environment Variables

Click "Environment Variables" and add these:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key
NVIDIA_API_KEY=nvapi-...
SENDGRID_API_KEY=SG....
TWILIO_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

**Important:** 
- Copy these from your `.env.local` file
- Make sure `NEXT_PUBLIC_` variables are exact
- Click "Add" after each one

### 2.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. You'll get a URL like: `https://studyflow-xyz.vercel.app`

## Step 3: Configure Vercel Cron Jobs

### 3.1 Verify vercel.json

The file already exists with this content:
```json
{
  "crons": [
    {
      "path": "/api/send-alerts",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9 AM UTC.

### 3.2 Check Cron Status

1. Go to Vercel Dashboard → Your Project
2. Click "Cron Jobs" tab
3. Verify `/api/send-alerts` is listed
4. Status should be "Active"

## Step 4: Post-Deployment Configuration

### 4.1 Update SendGrid Email

Edit `app/api/send-alerts/route.ts`:
```typescript
from: "noreply@yourdomain.com", // Replace with your verified sender
```

Then commit and push:
```bash
git add .
git commit -m "Update SendGrid sender email"
git push
```

Vercel will auto-deploy the update.

### 4.2 Test Your Deployment

Visit your Vercel URL and test:

1. **Dashboard** → Should load with gradient background
2. **Add Assignment** → Create a test assignment
3. **Generate AI Plan** → Click on assignment card
4. **Chat with AI** → Click floating button (bottom-right)
5. **Test Alerts** → Visit `/api/send-alerts` directly

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain

1. Vercel Dashboard → Your Project → Settings
2. Go to "Domains"
3. Add your domain (e.g., `studyflow.app`)
4. Follow DNS instructions

### 5.2 Update URLs

If using custom domain, update in `app/api/send-alerts/route.ts`:
```typescript
const assignmentUrl = `https://studyflow.app/assignment/${assignment.id}`;
```

## Troubleshooting 🔧

### Build Fails

**Error: "Module not found"**
```bash
# Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: "Environment variable not defined"**
- Check Vercel Dashboard → Settings → Environment Variables
- Make sure all required variables are added
- Redeploy from Deployments tab

### API Routes Return 500

**Check Logs:**
1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Go to "Functions" tab
4. Check error logs

**Common Issues:**
- NVIDIA API key invalid → Get new key from build.nvidia.com
- Supabase connection failed → Verify URL and key
- SendGrid/Twilio errors → Check API keys

### Cron Job Not Running

1. Check Vercel Dashboard → Cron Jobs
2. Verify schedule format is correct
3. Test manually: `curl https://your-app.vercel.app/api/send-alerts`
4. Check function logs for errors

## Monitoring & Maintenance

### Analytics

Enable Vercel Analytics:
1. Dashboard → Your Project → Analytics
2. Click "Enable"
3. Monitor page views, performance

### Logs

Check logs regularly:
1. Dashboard → Your Project → Logs
2. Filter by function (e.g., `/api/ai-chat`)
3. Look for errors or warnings

### Updates

To update your deployed app:
```bash
# Make changes
git add .
git commit -m "Your update description"
git push
```

Vercel auto-deploys on every push to
