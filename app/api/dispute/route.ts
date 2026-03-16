import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { formatOrderContext } from "@/lib/mockOrder";
import { mockOrder } from "@/lib/mockOrder";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Insta-Assist, a helpful and empathetic order dispute assistant for Instacart. Your job is to help customers resolve issues with missing, wrong, or undelivered orders.

Your conversation must do the following in order:
1. Understand what went wrong (missing items, wrong items, not delivered, damaged, or stolen)
2. Identify which specific items are affected — reference the order items provided in context
3. Collect evidence: ask if they have a photo of what was delivered (or the delivery spot if nothing arrived). Accept a text description if no photo.
4. Ask one clarifying question based on the issue type:
   - Missing items: "Was the bag sealed when it arrived, or were any items visibly missing?"
   - Not delivered: "Did you receive a delivery confirmation photo from your shopper?"
   - Wrong items: "Were the wrong items a substitution the shopper chose, or completely unrelated products?"
5. Once you have enough information, output a structured JSON resolution recommendation wrapped in <resolution> tags with this shape:
   {
     "complaint_type": "missing_items" | "not_delivered" | "wrong_items" | "damaged",
     "affected_items": ["item name", ...],
     "evidence_quality": "strong" | "moderate" | "weak",
     "recommended_resolution": "full_refund" | "partial_refund" | "redeliver" | "credit",
     "refund_amount": number,
     "confidence": 0-100,
     "reasoning": "one sentence explanation"
   }

After outputting the JSON, also show the customer a friendly plain-English summary of the resolution: e.g. "Based on what you've told me, I'm recommending a full refund of $12.47 for the 3 missing items. This has been submitted for review."

Keep responses concise (2-3 sentences max per turn). Be warm but efficient. Never ask more than one question per message.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: UIMessage[] = body.messages ?? [];
    const orderContext: string | undefined = body.orderContext;

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const context =
      orderContext ?? formatOrderContext(mockOrder);
    const system = `${SYSTEM_PROMPT}\n\nCurrent order context:\n${context}`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 1024,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("Dispute API error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Streaming failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
