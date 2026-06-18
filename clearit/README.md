# ClearIt

**Take a picture. Know what to do.**

ClearIt is a mobile-first PWA that explains confusing bills, forms, alerts, errors, and messages in plain English. Upload a photo, screenshot, or paste text — and get a clear explanation with urgency assessment, key details, and safe next steps.

---

## What ClearIt Does

- **Photo/image upload** — snap or upload a photo of any confusing document
- **Text paste** — paste text from emails, messages, or bills
- **Plain-English explanation** — AI explains what the item is, what it means, and what to do
- **Urgency assessment** — Low, Medium, High, Possible Scam, or Emergency
- **Key details extraction** — amounts, due dates, deadlines, senders
- **Scam detection** — watches for phishing, smishing, and fraud signals
- **Action tools** — call script, reply draft, checklist, simplified explanation
- **Share card** — copy or share a clean summary via Web Share API
- **Local history** — save and revisit analyses (stored on device, no database)
- **Demo mode** — works without an OpenAI API key using realistic mock data

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd clearit
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-...your-key-here...
OPENAI_MODEL=gpt-4o
```

> **No API key?** Leave `OPENAI_API_KEY` blank — the app runs in **demo mode** with realistic mock data.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or desktop.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | No | *(empty)* | Your OpenAI API key. If missing, app uses demo mode. |
| `OPENAI_MODEL` | No | `gpt-4o` | OpenAI model to use. Must support vision for image analysis. |

---

## Demo Mode

If `OPENAI_API_KEY` is not set, ClearIt returns realistic mock analyses from `/lib/demo/demoResults.ts`. The demo includes six example types:

1. Insurance Explanation of Benefits (Low urgency — not a bill)
2. Suspicious bank scam text (Possible Scam)
3. School permission slip (Medium urgency)
4. App installation error (Low urgency)
5. Medical portal prescription message (Medium urgency)
6. Overdue utility bill (High urgency)

---

## Deploy to Vercel

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual deploy

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard:
- `OPENAI_API_KEY` — your OpenAI API key
- `OPENAI_MODEL` — `gpt-4o` (recommended)

> **Important:** The OpenAI API key is only used server-side in `/app/api/analyze/route.ts`. It is never exposed to the client.

---

## Project Structure

```
/app
  page.tsx              — Home screen
  /analyze/page.tsx     — Upload / paste screen
  /result/page.tsx      — Result display screen
  /history/page.tsx     — Saved history screen
  /settings/page.tsx    — Settings screen
  /api/analyze/route.ts — Server-side AI endpoint

/components
  AppShell.tsx          — Layout wrapper with nav
  BottomNav.tsx         — Mobile bottom navigation
  Header.tsx            — App header
  ResultCard.tsx        — Full result display
  UrgencyBadge.tsx      — Urgency indicator badge
  SafetyNotice.tsx      — Scam/emergency warnings
  ClearItCard.tsx       — Shareable summary card
  LoadingAnalysis.tsx   — Animated loading screen
  EmptyState.tsx        — Empty state component
  ActionButton.tsx      — Reusable action button

/lib
  /ai
    clearitEngine.ts    — Main AI analysis function
    prompts.ts          — System and user prompts
    schema.ts           — Zod validation schemas
    safetyPlaybook.ts   — Post-AI safety checks
  /demo
    demoResults.ts      — Realistic mock results
  /storage
    history.ts          — LocalStorage history helpers
  types.ts              — TypeScript type definitions
  utils.ts              — Utility functions
```

---

## Security

- **API key never exposed client-side** — All OpenAI calls happen in `/app/api/analyze/route.ts` (server only)
- **No database** — History stored in browser LocalStorage only
- **No auth** — MVP, no user accounts
- **No image storage** — Images are compressed client-side and sent to the server for analysis only; they are not stored

---

## Adding Supabase Later

The codebase is structured to make Supabase integration straightforward:

1. Replace `localStorage` calls in `/lib/storage/history.ts` with Supabase queries
2. Add auth using `@supabase/ssr`
3. Add a `users` table and `analyses` table
4. Store images in Supabase Storage instead of base64

---

## Future Roadmap

- **Supabase auth and database** — User accounts, cloud sync
- **Family sharing** — Share analyses with family members
- **Trusted contacts** — Share results with a trusted helper
- **PDF support** — Upload PDF documents
- **Native iOS/Android wrapper** — Using Capacitor
- **Push reminders** — Reminders for detected deadlines
- **ClearIt Plus** — Paid tier with advanced features
- **Saved document vault** — Long-term document storage
- **Multi-language support** — Explain in other languages
- **Voice read-aloud mode** — Text-to-speech for results
- **Senior mode** — Larger text, simpler UI

---

## License

MIT
