# StudyFlow Notifications Guide 🔔

## Overview

Your StudyFlow app **already has a fully functional notification system** implemented! Here's how it works:

## How It Works

### Automatic Notifications
- **Runs daily at 9 AM UTC** (via Vercel Cron Job)
- **Checks for assignments** due within the next 3 days
- **Sends notifications** via Email (SendGrid) or SMS (Twilio)
- **Each user receives** notifications based on their preference (email/sms)

## Implementation Details

### 1. API Route: `/api/send-alerts`

Location: `app/api/send-alerts/route.ts`

**Features:**
- ✅ Fetches assignments due in ≤3 days
- ✅ Sends Email notifications via SendGrid
- ✅ Sends SMS notifications via Twilio
- ✅ Beautiful HTML email template
- ✅ Personalized messages with assignment details
- ✅ Error handling and logging

### 2. Cron Job Configuration

Location: `vercel.json`

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

**Schedule:** Daily at 9:00 AM UTC

### 3. Email Notification (SendGrid)

When a user selects "Email" as notification method:

**Subject:** `Assignment Due Soon: [Assignment Title]`

**Email Content:**
- 📚 StudyFlow branding with gradient colors
- Assignment title and days remaining
- Assignment description and due date
- Current progress percentage
- "View Assignment" button (links to assignment)
- Encouraging message

**Example:**
```
📚 StudyFlow Assignment Reminder

Hi there!

Your assignment "Math Homework - Solving a Linear Equation" 
is due in 2 days!

Description: Solve for x in the equation: 3x + 7 = 19...
Due Date: 10/11/2025
Progress: 0%

[View Assignment Button]

Don't forget to work on it! You've got this! 💪
```

### 4. SMS Notification (Twilio)

When a user selects "SMS" as notification method:

**Message Format:**
```
📚 StudyFlow Reminder: Your assignment "[Title]" 
is due in [X] day(s)! Don't forget to work on it. 
View details: https://studyflow.vercel.app/assignment/[id]
```

## Setup Requirements

### For Email Notifications (SendGrid)

1. **Create SendGrid Account:**
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Free tier: 100 emails/day

2. **Verify Sender Email:**
   - Settings → Sender Authentication
   - Verify your email (e.g., noreply@yourdomain.com)
   - **Important:** Update line 78 in `app/api/send-alerts/route.ts`:
     ```typescript
     from: "your-verified-email@yourdomain.com",
     ```

3. **Get API Key:**
   - Settings → API Keys
   - Create API Key with "Mail Send" permissions
   - Add to `.env.local` as `SENDGRID_API_KEY`

### For SMS Notifications (Twilio)

1. **Create Twilio Account:**
   - Sign up at [twilio.com](https://twilio.com)
   - Free trial: $15 credit

2. **Get Phone Number:**
   - Console → Phone Numbers → Buy a Number
   - Choose number with SMS capability

3. **Get Credentials:**
   - Dashboard shows:
     - Account SID (starts with `AC`)
     - Auth Token
     - Phone Number (format: +1XXXXXXXXXX)
   - Add to `.env.local`

## Testing Notifications

### Method 1: Manual Testing (Local)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Create test assignment:**
   - Go to http://localhost:3000
   - Add assignment with due date 1-3 days from now
   - Choose email or SMS notification
   - Use your real email/phone

3. **Trigger notifications:**
   ```bash
   curl http://localhost:3000/api/send-alerts
   ```

4. **Check for notification:**
   - Email: Check your inbox
   - SMS: Check your phone

### Method 2: Test in Production (Vercel)

1. **Deploy to Vercel**
2. **Visit endpoint:**
   ```
   https://your-app.vercel.app/api/send-alerts
   ```
3. **Check response:**
   ```json
   {
     "success": true,
     "message": "Sent 1 notifications",
     "sent": 1,
     "total": 1
   }
   ```

### Method 3: Wait for Cron Job

- Cron job runs automatically daily at 9 AM UTC
- Check Vercel Dashboard → Cron Jobs for execution logs
- Verify notifications were sent

## Notification Triggers

Notifications are sent for assignments that:
- ✅ Have a due date within the next 3 days (≤72 hours)
- ✅ Have not been submitted yet
- ✅ Have valid contact information (email/phone)

## Environment Variables

Required for notifications to work:

```env
# SendGrid (Email)
SENDGRID_API_KEY=SG.your-sendgrid-key

# Twilio (SMS)
TWILIO_SID=ACyour-twilio-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Cron Security
CRON_SECRET=your-random-secret
```

## Monitoring & Debugging

### Check Notification Logs

**In Vercel:**
1. Dashboard → Your Project → Logs
2. Filter by `/api/send-alerts`
3. Check for errors or success messages

**Response Structure:**
```json
{
  "success": true,
  "message": "Sent 2 notifications",
  "sent": 2,
  "total": 2,
  "errors": [] // if any
}
```

### Common Issues

**Email not sending:**
- ✅ Verify SendGrid API key is correct
- ✅ Check sender email is verified in SendGrid
- ✅ Review SendGrid Activity logs
- ✅ Check spam folder

**SMS not sending:**
- ✅ Verify Twilio credentials are correct
- ✅ Check phone number format (+1XXXXXXXXXX)
- ✅ Ensure Twilio account has balance
- ✅ For trial accounts, verify recipient number

**Cron not running:**
- ✅ Verify `vercel.json` exists in project root
- ✅ Check Vercel Dashboard → Cron Jobs
- ✅ Ensure environment variables are set
- ✅ Check function logs for errors

## Customization

### Change Notification Timing

Edit `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/send-alerts",
      "schedule": "0 18 * * *"  // 6 PM UTC instead
    }
  ]
}
```

### Change Days Threshold

Edit `app/api/send-alerts/route.ts` line 29:
```typescript
threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 7); // 7 days instead of 3
```

### Customize Email Template

Edit HTML in `app/api/send-alerts/route.ts` lines 83-96.

### Customize SMS Message

Edit message format in `app/api/send-alerts/route.ts` line 69.

## Production Checklist

Before deploying:
- [ ] SendGrid sender email verified
- [ ] Twilio account set up with phone number
- [ ] All environment variables added to Vercel
- [ ] Update sender email in code (line 78)
- [ ] Update assignment URL if using custom domain
- [ ] Test with real email/phone
- [ ] Verify cron job in Vercel Dashboard

## Summary

✅ **Notifications are fully implemented and ready to use!**
✅ **No additional code needed**
✅ **Just configure SendGrid/Twilio and deploy**

Once deployed to Vercel with proper environment variables, users will automatically receive notifications for assignments due within 3 days!
