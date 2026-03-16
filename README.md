# Smart Order Dispute Assistant

## What This Is

A prototype of an AI-powered order dispute assistant that replaces Instacart's static complaint form with a guided, conversational evidence-collection flow. Built to demonstrate a product solution to one of Instacart's most documented customer pain points: legitimate victims of missing or wrong orders being denied refunds because the system uses complaint frequency as a fraud proxy rather than complaint validity.

**Stack:** Next.js 14 · Tailwind CSS · shadcn/ui · Anthropic Claude API · Vercel AI SDK

---

## How This Was Built

The problem selection was research-driven, not assumed. I used Claude to query and synthesize customer complaints about Instacart across review platforms — BBB, Trustpilot, ConsumerAffairs, SiteJabber, Reddit, and PissedConsumer — and group them by theme. That surfaced eight distinct complaint categories: pricing and fees, missing and wrong orders, substitutions, customer service and refunds, delivery delays, billing errors, membership issues, and shopper behavior.

From that list, I evaluated each category against a single filter: **does AI genuinely solve this better than a form, a rule, or a human?** Most categories failed that test. Pricing complaints are a policy problem. Delivery delays are a logistics problem. Shopper behavior is a marketplace incentives problem. Adding AI to any of those would be AI for its own sake.

**Missing and wrong orders** passed the filter — because the core dysfunction is a **classification problem**, not a policy or logistics one. The system needs to distinguish a legitimate claim from a fraudulent one on a case-by-case basis, using natural language input and multiple contextual signals. That is exactly what an LLM is well-suited to do. Every other complaint category either had a better non-AI solution, or the AI would not meaningfully change the outcome.

---

## The Problem

Instacart's current dispute flow applies a blunt **"complaint cap"** — customers who file too many complaints are flagged and denied refunds, regardless of whether those complaints are legitimate. This creates a perverse outcome: repeat victims of genuine errors (missing items, non-deliveries, wrong orders) are treated the same as bad-faith claimants. The result is customer churn at the exact moment trust is most fragile — right after a bad order.

---

## The Solution

Replace frequency-based fraud detection with **evidence-based complaint classification**. The assistant:

- **Collects structured evidence** through natural conversation (no forms)
- **Classifies** the complaint type and affected items
- **Cross-references** the customer's account against backend verification signals the user cannot control or fake
- **Scores evidence quality** contextually across both layers
- **Recommends a resolution** with a confidence score
- **Routes low-confidence cases** to human agents automatically

---

## Three Things to Pay Attention To

### 1. The Evidence Quality Score

**This is the core product insight.**

The score (strong / moderate / weak) **replaces complaint frequency** as the primary fraud signal. Today, Instacart penalizes customers based on how often they complain. This prototype penalizes based on **how well-supported a complaint is**. A customer who has filed 10 complaints but provides a clear photo, specific item identification, and coherent account of what happened scores **strong** — and gets their refund. A first-time complainer who says "something seems off" with no specifics scores **weak** — and gets routed to review.

This is the difference between a rule-based system and a contextual one. The PM insight is that **frequency is a lazy proxy; evidence quality is the actual signal worth measuring.**

### 2. The Structured JSON Output

**The AI isn't just chatting — it's producing a structured decision.**

After gathering evidence, the assistant outputs a resolution recommendation in structured JSON:

```json
{
  "complaint_type": "missing_items",
  "affected_items": ["bananas", "yogurt"],
  "evidence_quality": "strong",
  "recommended_resolution": "full_refund",
  "refund_amount": 7.48,
  "confidence": 91,
  "reasoning": "Customer identified specific items, described intact bag with clear gap, consistent with shopper scan records."
}
```

This matters because it means the prototype is **not a dead-end demo** — it produces output that could plug directly into a real ops workflow. The JSON could feed an internal refund approval queue, a shopper behavior flagging system, or a finance reconciliation pipeline. A chat interface that only produces prose is a toy. **A chat interface that produces structured, actionable data is infrastructure.**

### 3. The Confidence Score & Human-in-the-Loop Routing

**This is the PM maturity signal.**

Cases with confidence **≥ 75%** are auto-resolved. **60–74%** are auto-resolved with monitoring. **40–59%** are routed to a human agent. **Below 40%** require manual review. This framing matters for three reasons:

- It shows you understand that **AI should assist resolution decisions, not own them entirely**
- It gives the ops team a **clear escalation trigger** without requiring them to review every case
- It creates a **feedback loop**: human agents who override the AI recommendation on low-confidence cases generate labeled training data that improves the model over time

In an interview, frame it this way: *"We're not replacing human judgment — we're reserving it for the cases that actually need it."*

---

## The Fraud Problem — and Why the Conversation Alone Is Not Enough

### The limitation

The conversational evidence layer is **gameable**. A bad actor who has read one Reddit thread about how Instacart disputes work can say all the right things — "sealed bag, two items missing, delivery photo shows the wrong door" — and produce a convincing-sounding account without any of it being true. This is called **prompt-optimized fraud**, and it is the single biggest weakness of any LLM-based resolution system that relies solely on what the customer says.

### The defense: verification signals the user cannot control

The AI conversation is **one signal layer**. The real defense is cross-referencing it against **backend signals the customer has no ability to fabricate**:

| Signal | What it does |
|--------|----------------|
| **Shopper GPS trace** | The shopper's phone logs a continuous GPS path during the entire delivery window. If a customer claims "nothing was delivered to my door" but the GPS trace shows the shopper standing at their exact address coordinates for 4 minutes, the claim weakens significantly — regardless of how convincing the chat account was. This is the strongest single anti-fraud signal available because it is generated by the shopper's device, not reported by the customer. |
| **Delivery confirmation photo metadata** | Shoppers photograph the delivery on completion. That photo contains a timestamp and geotag embedded in the file metadata. If the photo was taken at the customer's address coordinates at the right time, a "never delivered" claim is very hard to sustain. If the photo shows the interior of a car, a different building number, or a timestamp that precedes the order window, it corroborates the customer. Neither outcome is something the customer can manipulate. |
| **Item scan records** | Many retail partners log item-level scan data when the shopper picks each item. If the system shows the shopper scanned bananas and yogurt, a missing item claim for those specific items is weaker than a claim for items with no confirmed scan record. |
| **Account history pattern** | How often has this customer filed disputes? What is the ratio of disputes to completed orders? What resolution did they receive previously, and did they order again immediately after? A customer filing their first dispute in 40 orders is a very different risk profile from one who disputes 1 in every 4. The critical distinction from Instacart's current broken system: **history informs the confidence threshold for auto-resolution, not the resolution itself.** High dispute rate lowers the auto-resolve threshold — it does not trigger automatic denial. |
| **Cross-customer shopper anomalies** | If multiple customers from the same shopper's route on the same day file missing item or non-delivery complaints, that is a shopper-side signal, not a customer fraud signal. The system should detect this pattern and weight it accordingly — corroborating customers on that route while flagging the shopper for review. |

### How this changes the confidence score

The confidence score visible in the ResolutionCard is a **composite of both layers**:

```
Confidence = f(conversation_evidence, GPS_match, photo_metadata, scan_records, account_history)
```

A customer who says all the right things but whose shopper GPS places them at the delivery address for 4 minutes gets a **lower** confidence score than their chat account alone would suggest. A customer with a weak chat account but a delivery photo showing the wrong building gets a **higher** score. **The conversation is the front door; the backend signals are the verification layer.**

In this prototype, the backend signals are **mocked**. In production, they would be pulled from Instacart's existing shopper telemetry, photo storage, and order management systems — none of which require new data collection, only new integration.

### How to frame this in an interview

*"The chat evidence alone is gameable, and I'd be skeptical of any system that relies on it exclusively. The confidence score in this prototype is designed to be a function of both what the customer says and what the system already knows — GPS, photo metadata, scan records, account history. A customer who says all the right things but whose shopper GPS places them at the address for 4 minutes gets a lower confidence score than one whose delivery photo shows the wrong building. The conversation is the intake; the backend signals are the verdict."*

This is the strongest PM talking point in the project — it shows you anticipated the obvious attack on your own idea and designed a system that does not collapse under it.

---

## Verification Signals Panel

The **ResolutionCard** renders a **Verification Signals** panel showing which backend signals were checked and what they found. In the prototype these are mocked based on the complaint type, but they reflect the exact signals a production system would use:

| Signal | What it checks | Mock behavior |
|--------|----------------|---------------|
| **GPS trace** | Shopper location vs. delivery address | Matches on Test 1–3, anomaly on Test 2 |
| **Photo metadata** | Timestamp + geotag of delivery photo | Consistent on Test 1, mismatch on Test 2 |
| **Item scan records** | Whether shopper scanned claimed missing items | Missing scan flagged on Test 1 |
| **Account history** | Dispute ratio across order history | Low ratio on all test cases |
| **Shopper anomaly** | Other complaints on same route/day | None flagged on test cases |

---

## Test Cases

Run these scenarios to exercise all branches of the dispute flow:

### Test 1 · Clear-cut missing items (high confidence)

- **Input:** "I'm missing my bananas and yogurt."
- When asked for evidence, describe an otherwise complete delivery — sealed bag, receipt matches, just two items absent.
- **Verification signals:** GPS confirms delivery location, but item scan records show bananas were not scanned at checkout.
- **Expected output:** Evidence quality strong, full refund for 2 items, confidence 85–95%, auto-resolved.

### Test 2 · Full non-delivery with photo anomaly (high confidence)

- **Input:** "Nothing was delivered but I was charged."
- When asked about a delivery confirmation photo, say you received one but it shows someone else's door.
- **Verification signals:** GPS trace shows shopper at a different address; photo geotag does not match delivery address.
- **Expected output:** Evidence quality strong, full refund or redeliver, high confidence. The strongest demo case — backend signals fully corroborate the customer account.

### Test 3 · Wrong substitution with health implication (moderate-high confidence)

- **Input:** "The shopper replaced my whole milk with oat milk and I'm allergic."
- No photo available, but specific item identification is clear.
- **Verification signals:** GPS confirms delivery; substitution logged in order management system.
- **Expected output:** Evidence quality moderate, full refund on that item, confidence 65–80%. AI flags shopper substitution behavior in reasoning.

### Test 4 · Vague complaint, no evidence (low confidence → human routing)

- **Input:** "Something seems off with my order."
- Provide no specifics when asked. Say you don't have a photo and can't remember which items.
- **Verification signals:** GPS confirms delivery, photo metadata consistent, all items scanned. No corroborating signals.
- **Expected output:** Evidence quality weak, credit rather than refund, confidence below 60% — triggering human review routing. **The most important test case for an interview:** demonstrates the system is not trivially gameable because backend signals contradict the vague account.

### Test 5 · Damaged goods, no photo (moderate confidence)

- **Input:** "My chicken arrived warm and the yogurt container was cracked open."
- Say you don't have a photo but noticed immediately on unpacking.
- **Verification signals:** GPS confirms delivery; no scan anomaly; first dispute in account history.
- **Expected output:** Evidence quality moderate (plausible but unverified), partial refund, mid-range confidence 55–70%. May route to human depending on threshold.

---

## Local Setup

```bash
git clone https://github.com/your-username/instacart-dispute-assistant
cd instacart-dispute-assistant
npm install
```

Create a `.env.local` file in the root:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

Get a key at [console.anthropic.com](https://console.anthropic.com). A full demo session costs less than $0.01.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                        # Mock order summary + "Problem?" CTA
  dispute/
    page.tsx                      # AI chat dispute interface
    confirmation/page.tsx         # Submission confirmation screen
  api/
    dispute/route.ts              # Claude API route handler (streaming)
components/
  ChatBubble.tsx                  # Reusable chat bubble component
  ResolutionCard.tsx              # Resolution summary card + verification signals panel
lib/
  claude.ts                       # Claude API wrapper + system prompt
  mockOrder.ts                    # Mock order data
  mockSignals.ts                  # Mock backend verification signals by complaint type
```

---

## Product Context

This prototype was built as part of a PM application to Instacart. The FTC's $60M settlement with Instacart in December 2025 over opaque billing and satisfaction guarantees provides regulatory tailwind for a project like this — improving customer protection in dispute resolution is no longer just a retention play, it is a **compliance posture**.

The core bet: **reliability and post-order experience are Instacart's last durable differentiator** as DoorDash Grocery, Amazon Fresh, and Shipt close the convenience gap. The moment a customer has a bad order is the highest-churn-risk moment — and it is currently handled worst.
