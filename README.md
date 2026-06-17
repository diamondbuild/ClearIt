# ClearIt

**Take a picture. Know what to do.**

ClearIt is a mobile-first PWA that explains confusing real-life items — bills, insurance letters, school forms, app errors, bank alerts, medical portal messages, subscription charges, appliance warnings, HR emails, legal notices, parking tickets, and scammy messages — in plain English, and tells you what to do next.

Upload a photo, take a picture, or paste text. ClearIt returns:

1. **What this is**
2. **What it means**
3. **How urgent it is**
4. **What to do next**
5. **Safety warnings** (when needed)
6. Optional **call script, email reply, checklist, or shareable summary card**

It feels like a premium native mobile app — not a chatbot.

---

## Tech stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** with a custom design system (light + dark mode)
- **Framer Motion** for subtle animations
- **Lucide** icons
- **OpenAI** official JavaScript SDK (server-side only)
- **Zod** for schema validation
- **LocalStorage** for MVP history (no database, no auth)

The OpenAI API key is **never** exposed to the client. The browser calls our own
`/api/analyze` route, and only the server talks to OpenAI.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. (Optional) Set your OpenAI API key

Copy the example env file and fill in your key:

```bash
cp .env.example .env.local
```

```bash
# .env.local
OPENAI_API_KEY=sk-...      # leave blank to run in demo mode
OPENAI_MODEL=gpt-5.5       # any vision-capable chat model works
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On a phone, open it in Safari
(iOS) or Chrome (Android) and "Add to Home Screen" to use it like a native app.

### 4. Production build

```bash
npm run build && npm run start
```

---

## Demo mode (no API key needed)

If `OPENAI_API_KEY` is missing, ClearIt automatically runs in **demo mode** and
returns realistic mock analyses so you can fully test the UI. The demo picks a
believable result based on simple keyword heuristics on your input.

Included demo scenarios:

1. Insurance Explanation of Benefits (low urgency, "not a bill")
2. Suspicious bank text (possible scam)
3. School permission form (medium urgency)
4. App install error (low urgency)
5. Medical portal medication message (medium urgency, medical disclaimer)
6. Utility bill with past-due language (high urgency)
7. Generic fallback for anything else

Try the **example chips** on the home screen to see each one.

---

## How the AI flow works

```
Client (browser)
  → validates input, compresses images client-side
  → POST /api/analyze  (text and/or base64 image)

Server (/api/analyze + lib/ai/clearitEngine.ts)
  → validates the request with Zod
  → if no API key: returns a demo result
  → if API key:    calls OpenAI with Structured Outputs (json_schema)
  → validates the AI JSON with Zod
  → applies the rule-based Safety Playbook
  → returns clean, app-ready ClearItAnalysis JSON
```

### Safety Playbook (`lib/ai/safety.ts`)

Runs after the model output to make results safer and more consistent:

- Escalates to **Possible Scam** when multiple scam signals are detected
  (gift cards, crypto, wire transfers, "account locked", suspicious links,
  login/reset codes, SSN requests, etc.).
- Adds the standard "don't click links / call the number on your card" warning
  for scams.
- Forces tailored disclaimers for **medical**, **legal**, and **tax** categories.
- Surfaces a red **emergency** banner in the UI for emergency-level results.

---

## Project structure

```
app/
  page.tsx              # Home
  analyze/page.tsx      # Upload / take photo / paste text + loading
  result/page.tsx       # Result experience + action buttons
  history/page.tsx      # LocalStorage history
  settings/page.tsx     # Preferences, privacy, about, disclaimer
  api/analyze/route.ts  # Server AI route (Zod validated)
  layout.tsx · not-found.tsx

components/
  AppShell.tsx · Header.tsx · BottomNav.tsx · ThemeProvider.tsx
  UploadCard.tsx · PasteTextBox.tsx · LoadingAnalysis.tsx
  ResultCard.tsx · UrgencyBadge.tsx · SafetyNotice.tsx
  ActionButton.tsx · ClearItCard.tsx · Sheet.tsx · EmptyState.tsx

lib/
  ai/clearitEngine.ts   # Main engine: OpenAI call + validation + safety
  ai/prompts.ts         # System + user prompts
  ai/schema.ts          # Zod schema + JSON Schema for Structured Outputs
  ai/safety.ts          # Rule-based safety playbook
  demo/demoResults.ts   # Realistic mock results for demo mode
  storage/history.ts    # LocalStorage + sessionStorage helpers
  image.ts              # Client-side image compression/resize
  types.ts · utils.ts

styles/globals.css      # Design tokens + gradient + utilities
public/                 # manifest.webmanifest + icon.svg
```

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com/new), import the repo (framework auto-detected
   as Next.js).
3. Add environment variables in **Project Settings → Environment Variables**:
   - `OPENAI_API_KEY` (optional — omit to ship a working demo)
   - `OPENAI_MODEL` (e.g. `gpt-5.5`)
4. Deploy. Share the URL by text message — it installs as a home-screen app.

---

## What's still mocked / MVP limits

- **Demo mode** returns curated mock analyses when no API key is set.
- History is stored only in **LocalStorage** (per device, no sync).
- Uploaded **images are never persisted** — only sent to the AI for analysis.
- No accounts, payments, database, or push notifications in the MVP.

---

## Future roadmap

- Supabase auth and database (cloud history sync)
- Family sharing and trusted contacts
- PDF support
- Native iOS/Android wrapper with Capacitor
- Push reminders for detected deadlines
- Paid **ClearIt Plus** plan
- Saved document vault
- Multi-language support
- Voice read-aloud mode
- Senior mode with larger text (a basic version ships in Settings today)

---

ClearIt helps explain information. It does not replace professional legal,
medical, financial, or emergency advice.
