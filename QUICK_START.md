# StudyFlow - Quick Start Guide ⚡

Get your StudyFlow app running in 5 minutes!

## 🎯 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd studyflow
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

**For Quick Testing (Use Placeholders):**

```env
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
NVIDIA_API_KEY=placeholder-nvidia-key
SENDGRID_API_KEY=placeholder-sendgrid-key
TWILIO_SID=placeholder-sid
TWILIO_AUTH_TOKEN=placeholder-token
TWILIO_PHONE_NUMBER=+1234567890
```

> ⚠️ With placeholder values, database operations and AI features won't work, but you can see the UI.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Full Setup (For Production Use)

For a complete working app, you need actual API keys. Follow these guides:

1. **Database Setup**: See [DEPLOYMENT.md](DEPLOYMENT.md) → Step 1
2. **Get API Keys**: See [DEPLOYMENT.md](DEPLOYMENT.md) → Step 2
3. **Deploy to Vercel**: See [DEPLOYMENT.md](DEPLOYMENT.md) → Step 4

## 🎨 What You'll See

- **Dashboard**: Beautiful gradient background with assignment cards
- **Add Assignment Form**: Clean form to create new assignments
- **AI Chatbot**: Floating chat button in bottom-right corner
- **Responsive Design**: Works on mobile, tablet, and desktop

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📚 Key Features to Test

### With Placeholder Values (UI Only)
- ✅ View dashboard layout
- ✅ Navigate to Add Assignment page
- ✅ See chatbot UI (won't respond)
- ✅ View responsive design

### With Real API Keys (Full Functionality)
- ✅ Create and save assignments
- ✅ Generate AI study plans
- ✅ Chat with AI assistant
- ✅ Receive email/SMS notifications
- ✅ Track assignment progress

## 🐛 Common Issues

### Port Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Loading

- Restart the dev server after changing `.env.local`
- Ensure `.env.local` is in the project root
- Check variable names match exactly (case-sensitive)

## 📖 Next Steps

1. **Read Full Documentation**: [README.md](README.md)
2. **Deploy to Production**: [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Customize**: Edit components in `/components` and `/app`

## 🎓 Project Structure

```
studyflow/
├── app/                  # Next.js app directory
│   ├── page.tsx         # Dashboard
│   ├── add-assignment/  # Add assignment page
│   └── api/             # API routes
├── components/          # React components
├── lib/                 # Utilities (Supabase client)
├── database-schema.sql  # Database setup
└── .env.local.example   # Environment template
```

## 💡 Tips

- Use the floating chatbot for homework help
- Color-coded days remaining: Red (≤3), Yellow (≤7), Green (>7)
- AI plans are saved automatically to assignments
- Cron job runs daily at 9 AM UTC for notifications

## 🆘 Need Help?

- Check [README.md](README.md) for detailed documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
- Open an issue on GitHub

---

**Ready to study smarter? Let's go! 🚀📚**
