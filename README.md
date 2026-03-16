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

## Design

- Instacart orange `#FF6B00`, green `#003D29`
- Mobile-first, max-width 430px
- Chat styled like iMessage/WhatsApp with Insta-Assist avatar
