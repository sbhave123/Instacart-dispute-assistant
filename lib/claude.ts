import Anthropic from "@anthropic-ai/sdk";
import { formatOrderContext } from "./mockOrder";
import type { Order } from "./mockOrder";

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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getClaudeReply(
  order: Order,
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const orderContext = formatOrderContext(order);
  const system = `${SYSTEM_PROMPT}\n\nCurrent order context:\n${orderContext}`;

  const anthropic = new Anthropic({ apiKey });

  const formattedMessages = messages.map((m) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.content,
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system,
    messages: formattedMessages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return "I'm sorry, I couldn't process that. Please try again.";
  }
  return textBlock.text;
}

/** If the message contains a <resolution> tag, parse the JSON inside and return it; otherwise null. */
export function parseResolutionFromResponse(response: string): Resolution | null {
  const match = response.match(/<resolution>([\s\S]*?)<\/resolution>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim()) as Resolution;
    if (
      parsed.complaint_type &&
      Array.isArray(parsed.affected_items) &&
      parsed.recommended_resolution &&
      typeof parsed.refund_amount === "number" &&
      typeof parsed.confidence === "number"
    ) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export interface Resolution {
  complaint_type: "missing_items" | "not_delivered" | "wrong_items" | "damaged";
  affected_items: string[];
  evidence_quality: "strong" | "moderate" | "weak";
  recommended_resolution: "full_refund" | "partial_refund" | "redeliver" | "credit";
  refund_amount: number;
  confidence: number;
  reasoning: string;
}
