# StudyFlow Setup Guide - Fix Database Connection Error 🔧

You're seeing the "TypeError: fetch failed" error because the app needs real Supabase credentials to work.

## Quick Fix (5 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free tier available)
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - Name: `studyflow` (or any name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose closest to you
6. Click "Create new project"
7. Wait ~2 minutes for setup to complete

### Step 2: Set Up Database

1. In your Supabase Dashboard, click on "SQL Editor" (left sidebar)
2. Click "New Query"
3. Open the file `studyflow/database-schema.sql` from your project
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

### Step 3: Get Your API Credentials

1. In Supabase Dashboard, click "Settings" (⚙️ icon in sidebar)
2. Click "API" in the left menu
3. You'll see two values you need:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 4: Create Environment File

Create a file named `.env.local` in your project root (`c:/Users/rajas/Desktop/studyflow/`) with this content:

```env
# Supabase (REQUIRED - Replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NVIDIA API (OPTIONAL - For AI features)
NVIDIA_API_KEY=your-nvidia-key

# SendGrid (OPTIONAL - For email notifications)
SENDGRID_API_KEY=your-sendgrid-key

# Twilio (OPTIONAL - For SMS notifications)
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Replace the placeholder values** with your actual Supabase credentials from Step 3.

### Step 5: Restart Dev Server

1. Stop the current dev server (Ctrl + C in terminal)
2. Restart it:
   ```bash
   npm run dev
   ```
3. Visit http://localhost:3000
4. Try adding an assignment - it should work now! ✅

## Testing the Setup

After setting up, test these features:

1. **Add Assignment**: 
   - Go to "Add New Assignment"
   - Fill in: Title, Description, Due Date, Email
   - Click "Add Assignment"
   - Should redirect to dashboard and show your assignment

2. **Dashboard**:
   - Should now show your assignments
   - Each card displays progress, due date, days left

## Optional: AI Features

For AI study plans and chatbot to work, you need an NVIDIA API key:

1. Go to [build.nvidia.com](https://build.nvidia.com/)
2. Sign up (free tier available)
3. Generate API key
4. Add to `.env.local`:
   ```
   NVIDIA_API_KEY=nvapi-xxxxx
   ```
5. Restart dev server

## Optional: Notifications

For email/SMS alerts:

**SendGrid** (Email):
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify a sender email
3. Create API key
4. Add to `.env.local`

**Twilio** (SMS):
1. Sign up at [twilio.com](https://twilio.com)
2. Get a phone number
3. Get SID and Auth Token
4. Add to `.env.local`

## Common Issues

### "Supabase error: fetch failed"
- ✅ Make sure `.env.local` exists in the project root
- ✅ Verify Supabase URL and key are correct (no typos)
- ✅ Restart dev server after creating/editing `.env.local`

### "Table does not exist"
- ✅ Run the SQL schema in Supabase SQL Editor
- ✅ Verify table was created: Supabase Dashboard → Table Editor

### Changes not appearing
- ✅ Always restart dev server after changing `.env.local`
- ✅ Hard refresh browser (Ctrl + Shift + R)

## Need More Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for production deployment
- Check `QUICK_START.md` for quick setup steps

---

**Once you complete Steps 1-5, your app will be fully functional! 🎉**
