# CompeteScope 🔍

**AI-powered competitive intelligence for micro-SaaS founders**

Track competitor changes automatically, detect what matters, get actionable insights via email digest.

## ⚡ Status: MVP Complete (OPERATIONAL)

- ✅ Authentication (Supabase)
- ✅ Project Management (CRUD)
- ✅ Competitor Tracking (CRUD)
- ✅ Web Scraping (real-time)
- ✅ AI Analysis (OpenAI)
- ✅ Email Digest (Resend)
- ✅ Dashboard (Next.js)

## 🎯 What It Does

1. **Monitor competitors** → Add URLs to track (homepage, pricing, changelog)
2. **Automatic scraping** → Detects changes on websites
3. **AI analysis** → Understands implications using GPT-4
4. **Weekly digest** → Email summary of competitive moves
5. **Dashboard insights** → See all changes in one place

## 🏗️ Tech Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + Node.js
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI (GPT-4o mini)
- **Email:** Resend
- **Hosting:** Vercel
- **Auth:** Supabase Auth

## 📦 Features Implemented

### Authentication
- Email/password signup + email verification
- Secure login with session persistence
- Protected dashboard routes

### Project Management
- Create/edit/delete projects
- Organize competitors by project
- Project detail view with competitor list

### Competitor Tracking
- Add competitors with URLs (homepage, pricing, changelog)
- Real-time scraping of competitor websites
- Content hash comparison to detect changes
- Last scraped timestamp

### AI Analysis
- Automatic analysis when changes detected
- Extracts: "What Changed", "Implication", "Your Action"
- JSON-formatted responses from OpenAI

### Email Digest
- Weekly digest (Monday 9 AM UTC via Vercel Cron)
- Groups changes by project
- Professional HTML template
- Includes actionable insights
- Unsubscribe link

### Dashboard
- Overview of all projects + competitors
- Real-time change detection
- Analysis modal viewer
- Scrape button for manual triggering

## 🚀 Quick Start

### Prerequisites
```
Node.js 18+
npm or pnpm
Supabase account
OpenAI API key
Resend account (free tier ok)
```

### Installation

1. Clone repo
```bash
git clone https://github.com/mrsteppenwolf627/CompeteScope.git
cd CompeteScope
```

2. Install dependencies
```bash
npm install
```

3. Setup .env.local
```bash
cp .env.example .env.local
```

4. Add your credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
CRON_SECRET=your_random_secret
```

5. Setup database
```bash
# Run SQL schema from supabase-schema.sql in Supabase SQL Editor
```

6. Start development server
```bash
npm run dev
```

Open http://localhost:3000

## 📋 API Endpoints

### Projects
```
GET    /api/projects          - List user's projects
POST   /api/projects          - Create project
GET    /api/projects/[id]     - Get project detail
PUT    /api/projects/[id]     - Update project
DELETE /api/projects/[id]     - Delete project
```

### Competitors
```
GET    /api/competitors?project_id=UUID  - List competitors
POST   /api/competitors                  - Add competitor
DELETE /api/competitors/[id]             - Remove competitor
```

### Scraping & Analysis
```
POST /api/scrape  - Manual scrape (body: {competitor_id})
                    Returns: {changed: bool, snapshot_id: UUID, analysis: {...}}
```

### Email Digest
```
POST /api/digest/send                           - Send digest for logged-in user
GET  /api/digest/send?cron_secret=xxx           - Bulk send (all users)
GET  /api/digest/send?cron_secret=xxx&user_id=y - Send for specific user
```

## 🧪 Testing

### Manual Scrape
```javascript
// From console on logged-in dashboard
fetch('/api/scrape', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({competitor_id: 'UUID_HERE'})
})
.then(r => r.json())
.then(console.log)
```

### Manual Digest
```javascript
// From console on logged-in dashboard
fetch('/api/digest/send', { method: 'POST' })
.then(r => r.json())
.then(console.log)
```

## 📊 Database Schema

- `projects` — User's tracking projects
- `competitors` — Websites to monitor
- `competitor_snapshots` — Historical website versions + AI analysis

See `supabase-schema.sql` for full schema.

## 🔄 How It Works

1. User creates project + adds competitors
2. **Option A (Manual):** Click "Scrape Now" button
3. **Option B (Automatic):** Vercel Cron runs `GET /api/digest/send` every Monday 9 AM
4. Scraper fetches competitor URL
5. Content hash compared to last snapshot
6. If changed → OpenAI analyzes diff
7. Snapshot + analysis saved to DB
8. Email digest generated with all weekly changes
9. User receives email with insights

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
```bash
git push origin master
```

2. Connect repo to Vercel

3. Add environment variables in Vercel Settings:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY
CRON_SECRET
NODE_ENV=production
```

4. Vercel automatically deploys on push

5. Cron job is configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/digest/send",
    "schedule": "0 9 * * 1"
  }]
}
```

## 💡 Future Improvements

- [ ] Slack integration for alerts
- [ ] Custom scraping rules per competitor
- [ ] Competitor comparison matrix
- [ ] Price history tracking
- [ ] Feature changelog parsing
- [ ] Team collaboration
- [ ] API for third-party integrations
- [ ] Stripe integration for payments
- [ ] Advanced filtering + search

## 📄 License

MIT

## 👨‍💻 Built By

Aitor Alarcón — AI Orchestration (Claude + Gemini) during 7-hour hackathon

---

**Last Updated:** April 2, 2026
**Version:** 0.1.0 (MVP)
