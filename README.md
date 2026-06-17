# ClearIt

ClearIt is a mobile-first PWA MVP for answering: “What is this, and what do I do?” Users can upload a photo/screenshot or paste confusing text from bills, forms, alerts, errors, notices, and messages. ClearIt returns a plain-English explanation, urgency, safe next steps, warnings, key details, and a shareable summary card.

Tagline: **Take a picture. Know what to do.**

## What is built

- Next.js App Router with TypeScript
- Tailwind CSS mobile-first design system
- Polished Home, Analyze, Result, History, and Settings screens
- `/api/analyze` server route
- OpenAI official JavaScript SDK used server-side only
- Zod request/result validation
- Demo mode when `OPENAI_API_KEY` is missing
- LocalStorage history for saved explanations
- Copy/share ClearIt Summary card
- PWA manifest for quick mobile sharing/installing

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5.5
```

The OpenAI key is only read by the server route and is never exposed to client-side code.

## Demo mode

If `OPENAI_API_KEY` is missing, ClearIt automatically returns realistic mock analyses so you can test the full UI. You can also force demo mode from **Settings**.

Included demo scenarios:

1. Insurance Explanation of Benefits, low urgency, not a bill
2. Suspicious bank text, possible scam
3. School permission form, medium urgency
4. App install error, low urgency
5. Medical portal medication message, medium urgency
6. Utility bill or shutoff warning, high urgency

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (defaults to `gpt-5.5` if omitted)
4. Deploy.

The app uses the Next.js App Router and does not require a database for the MVP.

## Future roadmap

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
