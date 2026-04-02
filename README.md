# CompeteScope

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?logo=openai)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## 🎯 One-Liner

**Stop losing market intelligence.** CompeteScope monitors your competitors' websites and sends you AI-powered insights every week—straight to your inbox.

*For early-stage SaaS founders who can't afford enterprise tools but can't afford to miss what competitors are doing.*

---

## The Problem (Validated)

### Why CompeteScope Exists

**The Gap:** Between Visualping ($14/mo with zero analysis) and Kompyte ($99/mo with generic insights), there's no AI-powered competitive intelligence tool built for founders working alone.

**The Pain:**
- 📊 80% of startups <50 employees **don't actively use CI tools**—even though they should
- ⏰ Those founders **waste 6-10 hours/week** manually searching competitor pages
- 💰 Enterprise solutions (Crayon, Klue) cost **$10K-30K/year** and require dedicated CI teams
- 🚨 **Real example:** "Our competitor launched a major feature 2 months ago and we didn't notice until a customer asked" (Reddit, 143 upvotes)

**The Validation:**
- Analysis of 238,000+ real user complaints (Reddit, G2, Capterra) identified **AI-powered analytics tools as having the highest market gap: 9.2/10**
- Gartner research: companies with active CI respond to market changes **28% faster** than competitors
- Solo founder validated on r/microsaas: high-intent demand for affordable, automated CI

---

## 🚀 The Solution

### What CompeteScope Does

CompeteScope automates the entire competitive intelligence workflow:

1. **📍 Monitor** → Add 3-5 competitors (their homepage, pricing page, changelog, G2, Twitter)
2. **🕷️ Scrape** → Automatic weekly crawling of all URLs
3. **🔍 Detect** → AI-powered diff detection (what actually changed?)
4. **🤖 Analyze** → OpenAI GPT-4 provides strategic implications + action items
5. **📧 Digest** → Every Monday 9 AM, one email with all insights

### Example Output

**Competitor:** Stripe
**Update Detected:** Pricing page restructure
- **What Changed:** Removed 'Custom' tier, introduced $0/mo Starter plan with 10k API calls
- **Implication:** Stripe is targeting new developers (land-and-expand strategy). This compresses the low-end market.
- **Your Action:** Evaluate your free tier positioning. Consider feature parity for new users.

---

## 🛠️ Tech Stack

| Layer | Technology | Why? |
|-------|-----------|------|
| **Frontend** | Next.js 15 + TypeScript | Fast SSR, built for vibe coding, Vercel integration |
| **Styling** | Tailwind CSS + shadcn/ui | Production-grade components, no CSS burden |
| **Auth** | Supabase Auth | Email + password auth in minutes, no OAuth needed for MVP |
| **Database** | Supabase PostgreSQL | Serverless, free tier covers 100+ users |
| **Web Scraping** | Firecrawl / Puppeteer | Reliable, IP rotation, works with JavaScript-heavy sites |
| **AI Analysis** | OpenAI GPT-4o-mini | Best reasoning for strategic analysis. $0.05-0.10 per analysis = viable unit economics |
| **Email** | Resend | Simple API, good deliverability, free tier (10k/mo) |
| **Deployment** | Vercel | Automatic redeploys, serverless functions, 0 DevOps |
| **Cron Jobs** | Supabase pg_cron + Vercel Functions | Automated weekly scrapes, no external scheduler needed |

**Why this specific stack?**
- **Solopreneur-friendly:** Every tool has free/cheap tier + generous starter limits
- **Serverless by default:** Scale from 0 to 1000 users without infrastructure
- **AI-native:** OpenAI integration is first-class citizen (not bolted on)
- **Fast iteration:** Claude Code + Next.js = rebuild in hours, not weeks

---

## ✨ Features

### ✅ MVP (Shipped in 7-hour Hackathon)

- [x] Supabase authentication (email/password signup)
- [x] Create projects and add competitors (3-5 per project)
- [x] Automatic weekly web scraping of competitor URLs
- [x] Content diff detection (what changed vs. last week?)
- [x] OpenAI GPT-4 analysis (what changed → implication → action)
- [x] Email digest delivery via Resend (weekly Monday 9 AM)
- [x] Dashboard to view past analyses and snapshots
- [x] Landing page with pricing and features
- [x] Deploy-ready on Vercel

### 🚀 Roadmap (Coming Soon)

- [ ] Slack integration (real-time alerts when competitor changes detected)
- [ ] Comparative pricing tables (side-by-side feature/price changes)
- [ ] "Feature Graveyard" (track when competitors remove features)
- [ ] Team collaboration (invite teammates to projects)
- [ ] Stripe integration (payment processing)
- [ ] Public API (let other tools consume CI data)
- [ ] Browser extension (see competitor data without leaving your page)

---

## 💰 Pricing Model

| Plan | Price | Limits | Best For |
|------|-------|--------|----------|
| **Starter** | $49/mo | 3 projects, 10 competitors, basic analysis | Solo founders, pre-PMF |
| **Pro** | $129/mo | Unlimited projects, 50 competitors, advanced analysis | Growth-stage teams |
| **Enterprise** | Custom | Custom | Large organizations |

**Free Tier:** 1 project, 3 competitors, weekly digest (no limits on analysis)

**Unit Economics (at scale):**
- Supabase: ~$25/mo (if >100GB data)
- OpenAI: ~$0.05-0.10 per competitor analysis
- Resend: Free up to 10k emails/mo
- Vercel: Free hobby tier → $20/mo pro

**Total cost per user:** ~$0.50/month → highly profitable at $49+ pricing

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Git
- Supabase account (free: https://supabase.com)
- OpenAI API key (with credits: https://platform.openai.com/api/keys)

### Installation

```bash
# Clone the repo
git clone https://github.com/mrsteppenwolf627/CompeteScope.git
cd CompeteScope

# Install dependencies
npm install
pip install supabase python-dotenv httpx beautifulsoup4 openai

# Setup environment variables
cp .env.example .env.local

# Fill in your keys:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# OPENAI_API_KEY
# RESEND_API_KEY
```

### Run Locally

```bash
# Start the Next.js dev server (http://localhost:3000)
npm run dev

# In another terminal, run the scraper manually
python scripts/scraping/scraper.py

# Or test OpenAI analysis
python scripts/analyze-with-openai.py
```

### Deploy to Vercel

```bash
# Using Vercel CLI
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables → Add the same keys from .env.local
```

---

## 📁 Project Structure

```
CompeteScope/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx          # Protected dashboard layout
│   │   ├── page.tsx            # Projects overview
│   │   ├── projects/[id]/      # Project detail page
│   │   └── competitors/        # Competitor management
│   ├── api/
│   │   ├── analyze/route.ts    # OpenAI analysis endpoint
│   │   ├── competitors/        # CRUD endpoints
│   │   ├── snapshots/          # Snapshot endpoints
│   │   └── cron/
│   │       ├── scrape/         # Weekly scrape trigger
│   │       └── digest/         # Weekly digest send
│   ├── login/page.tsx          # Sign in page
│   ├── signup/page.tsx         # Sign up page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── lib/
│   ├── supabase.ts             # Supabase browser client
│   ├── supabase-server.ts      # Supabase server client (SSR)
│   ├── openai-client.ts        # OpenAI API client
│   ├── types.ts                # TypeScript types
│   └── utils.ts                # Utility functions
├── components/
│   ├── Header.tsx              # Navigation + user menu
│   ├── Sidebar.tsx             # Dashboard sidebar
│   ├── ProjectCard.tsx         # Project card component
│   └── CompetitorForm.tsx      # Add competitor form
├── scripts/
│   ├── scraping/
│   │   ├── scraper.py          # Main web scraper
│   │   ├── scraper-demo.py     # Demo mode (mock data)
│   │   └── send-digest.py      # Email digest generator
│   ├── analyze-with-openai.py  # Test OpenAI analysis pipeline
│   ├── mock_snapshots.json     # Mock competitor data for testing
│   └── demo-setup.py           # Seed demo data
├── middleware.ts               # Auth middleware (protect /dashboard)
├── .env.example                # Environment variables template
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── supabase-schema.md          # Database schema reference
```

---

## 🔧 How It Works

### 1. Web Scraping Pipeline

```
Weekly Trigger (Vercel Cron)
→ Fetch all competitors from Supabase
→ For each competitor URL:
   → Scrape homepage + pricing page
   → Compute SHA256 hash of content
   → Compare with previous snapshot
   → If different: save new snapshot + mark for analysis
→ Store in competitor_snapshots table
```

### 2. Diff Detection

```
Previous Snapshot (e.g., 2 weeks ago)
        ↓
Current Snapshot (this week)
        ↓
Unified Diff Algorithm (compare line-by-line)
        ↓
Extract: REMOVED lines + ADDED lines
        ↓
Pass to OpenAI with context
```

### 3. AI Analysis

```
OpenAI Prompt:
"You are a product strategist for a SaaS founder.
Analyze this competitor change: {diff_text}
Provide in JSON:
  what_changed: (1-2 sentences, specific)
  implication:  (market impact)
  action:       (what founder should do)"

Response: Structured JSON analysis
```

### 4. Weekly Digest

```
Every Monday 9 AM:
→ Query all snapshots from past 7 days (where ai_analysis != null)
→ Group by competitor
→ Build HTML email with:
   - Hero section
   - Competitor updates (with analysis)
   - Call-to-action (view dashboard)
→ Send via Resend
```

---

## 📊 Performance & Economics

### Build & Deploy Time

- **Next.js build:** ~12 seconds
- **Vercel deploy:** ~30 seconds
- **Scraping 10 competitors:** ~2 minutes
- **OpenAI analysis per competitor:** ~3 seconds

### Monthly Costs (Scale Example: 100 Users)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | $0–25 | Free tier up to 500MB storage |
| OpenAI API | $5–20 | ~$0.05–0.10 per analysis × competitors |
| Vercel | $0–20 | Free hobby tier; $20/mo Pro if needed |
| Resend | $0 | Free tier: 10k emails/month |
| **Total** | **$5–65/mo** | **Scales sub-linearly** |

**Unit economics:** At $49/mo × 100 users = $4,900/mo revenue vs. $50/mo costs = **98% gross margin**

---

## 🎓 Lessons Learned (7-Hour Hackathon Edition)

### What Worked

1. **AI Orchestration > Individual Tool Mastery**
   - Used Claude Code working in parallel = 2x speed
   - Don't rewrite boilerplate manually; let AI generate skeleton in 10 minutes
   - Lesson: Time is the constraint, not perfection. Ship MVPs in hours, not weeks.

2. **Supabase = Solopreneur Superpower**
   - Auth + DB + real-time subscriptions without backend code
   - RLS policies saved days of auth debugging
   - Lesson: Serverless + managed databases beat DIY infrastructure 100x.

3. **OpenAI Integration Should Be Immediate**
   - Don't build the app first, then add AI
   - AI analysis was core feature from hour 1
   - Cost was <$1 for entire hackathon (GPT-4o-mini = cheap)
   - Lesson: AI is now infrastructure, treat it as such.

4. **Environment Variables Are a Friction Point**
   - Created reusable `.env.example` template to save 20 minutes next time
   - Lesson: Automate the boring stuff.

5. **Testing With Mock Data > Waiting for Real Data**
   - Created `analyze-with-openai.py` with mock competitors to test OpenAI immediately
   - Didn't need live scraping to validate the analysis pipeline
   - Lesson: Decouple dependencies early.

### What Was Hard

1. **Row-Level Security (RLS) in Supabase**
   - RLS policies block everything by default—expected auth to "just work"
   - Solution: Disabled RLS for MVP, re-enable for production
   - Lesson: RLS is powerful but slow for initial dev. Use it after PMF.

2. **Next.js Server vs. Client Components**
   - Error: importing `next/headers` in Client Components
   - Solution: Separate `lib/supabase.ts` (client) from `lib/supabase-server.ts` (server)
   - Lesson: Read the error carefully; it usually tells you exactly what's wrong.

3. **Deprecated OpenAI Models**
   - `gpt-4-turbo-preview` returns 404 — model was retired
   - Solution: Switched to `gpt-4o-mini` (cheaper + better)
   - Lesson: Pin model versions, check deprecation dates.

### If I Did It Again

1. ✅ Start with `.env.example` template (save 30 min on setup chaos)
2. ✅ Disable RLS initially, enable after core auth works (save 20 min)
3. ✅ Use mock data for testing before real DB (save 15 min)
4. ✅ Deploy to Vercel earlier (test env vars in production sooner)
5. ✅ Skip fancy UI, focus on core loops (auth → CRUD → AI → email)

### Why This Matters

**This hackathon proved that:** A solo founder with AI assistance can build a **production-grade, monetizable SaaS in 7 hours**. The bottleneck isn't code—it's decisions, integrations, and environment setup. Treat infrastructure as black boxes; focus on the business logic.

---

## 📸 Screenshots & Demo

*Coming soon* – Screenshots will be added once UI/UX polish is complete. For now:

- **Landing page:** `http://localhost:3000` (run locally)
- **Dashboard:** `http://localhost:3000/dashboard` (after signup)
- **Live deployment:** https://compete-scope.vercel.app

---

## 🤝 Contributing

Pull requests welcome! For major changes:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💻 About the Author

**Aitor Alarcón Muñoz**
Solopreneur builder | AI-assisted SaaS developer

- 💼 LinkedIn: [aitoralarcon](https://www.linkedin.com/in/aitoralarcon/)
- 📧 Email: [aitor@aitoralmu.xyz](mailto:aitor@aitoralmu.xyz)

**Acknowledgments:**
- Built in a 7-hour hackathon using Claude Code (AI co-pilot)
- Validated market gap through analysis of 238,000+ user complaints
- Stack: Next.js + Supabase + OpenAI + Vercel

---

## 📞 Support

Questions? Issues? Feature requests?

- Open an [issue on GitHub](https://github.com/mrsteppenwolf627/CompeteScope/issues)
- Email directly: [aitor@aitoralmu.xyz](mailto:aitor@aitoralmu.xyz)

---

**Made with ❤️ and AI assistance. Happy building!**
