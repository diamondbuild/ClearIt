# ClearIt

**Take a picture. Know what to do.**

ClearIt is a mobile-first PWA MVP that helps people understand confusing real-life documents, messages, screenshots, bills, and alerts in plain English.

Users can upload an image or paste text, then get:

1. What this is
2. What it means
3. How urgent it is
4. Safe next steps
5. Warnings (including scam checks)
6. Optional helper outputs (call script, reply draft, checklist, simpler explanation, shareable summary card)

---

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Zod validation
- OpenAI JavaScript SDK (server-side only)
- LocalStorage history (MVP, no DB/auth yet)

---

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
```

- `OPENAI_API_KEY` is optional for MVP UI testing.
- If no key is present, ClearIt automatically runs in **demo mode** with realistic mock analysis results.
- The key is never exposed client-side; client calls `/api/analyze`, server calls OpenAI.

---

## Demo Mode

When no API key exists (or when Demo Mode is toggled in Settings), the app returns realistic mock outputs, including:

1. Insurance EOB (low urgency, not a bill)
2. Suspicious bank alert (possible scam)
3. School permission form (medium urgency)
4. App install error (low urgency)
5. Medical portal message (medical disclaimer)
6. Utility bill style output (high urgency)

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to `gpt-5.5`)
4. Deploy.

The app is App Router compatible and ready for standard Vercel deployment.

---

## Project Structure

```text
/app
  /api/analyze/route.ts
  /analyze/page.tsx
  /history/page.tsx
  /result/page.tsx
  /settings/page.tsx
  /page.tsx
/components
  AppShell.tsx
  BottomNav.tsx
  Header.tsx
  UploadCard.tsx
  PasteTextBox.tsx
  ResultCard.tsx
  UrgencyBadge.tsx
  ActionButton.tsx
  ClearItCard.tsx
  LoadingAnalysis.tsx
  EmptyState.tsx
  SafetyNotice.tsx
/lib
  /ai
    clearitEngine.ts
    prompts.ts
    schema.ts
  /demo/demoResults.ts
  /storage/history.ts
  utils.ts
  types.ts
/styles/globals.css
```

---

## Future Roadmap

- Supabase auth and database
- Family sharing
- Trusted contacts
- PDF support
- Native iOS/Android wrapper with Capacitor
- Push reminders for deadlines
- Paid ClearIt Plus plan
- Saved document vault
- Multi-language support
- Voice read-aloud mode
- Senior mode with larger text
