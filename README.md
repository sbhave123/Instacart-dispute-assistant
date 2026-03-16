# Smart Order Dispute Assistant (Instacart)

A PM portfolio prototype showing how AI can replace Instacart’s blunt complaint form with a guided, evidence-collecting dispute flow.

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **shadcn-style** components (Tailwind + `cn()`)
- **Anthropic Claude** (`claude-sonnet-4-20250514`) for dispute logic
- **Framer Motion** for transitions
- No database — local state only

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API key**

   Copy `.env.example` to `.env.local` and set your Anthropic API key:

   ```bash
   cp .env.example .env.local
   # Edit .env.local: ANTHROPIC_API_KEY=your_key_here
   ```

3. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Landing** — Mock order summary (Whole Foods, 5–6 items, total $67.42) with a “Problem with this order?” CTA.
2. **Dispute chat** — Full-screen chat with **Insta-Assist**. The AI collects what went wrong, affected items, evidence (photo or description), and one clarifying question, then outputs a `<resolution>` JSON block.
3. **Resolution card** — Parsed summary: complaint type, affected items, evidence quality, recommended resolution, refund amount, confidence bar, and “Submit Dispute”.
4. **Confirmation** — Checkmark, “Your dispute has been submitted”, 2-hour ETA, reference number, “Reviewed by AI + human team”.

## File structure

- `app/page.tsx` — Order summary landing
- `app/dispute/page.tsx` — Chat UI and resolution display
- `app/dispute/confirmation/page.tsx` — Post-submit confirmation
- `app/api/chat/route.ts` — Claude API proxy
- `components/ChatBubble.tsx` — Chat bubble component
- `components/ResolutionCard.tsx` — Resolution summary card
- `lib/claude.ts` — Claude client and resolution parsing
- `lib/mockOrder.ts` — Mock order data

## Deploy to Vercel

1. **Push your code to GitHub** (if you haven’t already):

   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push -u origin main
   ```

2. **Import the project on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in (or create an account).
   - Click **Add New… → Project** and import your GitHub repo (`sbhave123/Instacart-dispute-assistant`).
   - Leave **Framework Preset** as Next.js and **Root Directory** blank. Click **Deploy**.

3. **Add your API key**
   - After the first deploy finishes, open your project on Vercel → **Settings → Environment Variables**.
   - Add:
     - **Name:** `ANTHROPIC_API_KEY`
     - **Value:** your Anthropic API key (e.g. `sk-ant-api03-...`)
     - **Environment:** Production (and optionally Preview if you want it for PRs).
   - Click **Save**, then go to **Deployments**, open the **⋯** on the latest deployment, and choose **Redeploy** so the new env is used.

4. **Done.** Your app will be live at `https://your-project.vercel.app`. The dispute chat and resolution flow will work once `ANTHROPIC_API_KEY` is set and redeployed.

## Design

- Instacart orange `#FF6B00`, green `#003D29`
- Mobile-first, max-width 430px
- Chat styled like iMessage/WhatsApp with Insta-Assist avatar
