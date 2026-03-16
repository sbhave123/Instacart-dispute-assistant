import { NextRequest, NextResponse } from "next/server";
import { getClaudeReply } from "@/lib/claude";
import { mockOrder } from "@/lib/mockOrder";
import type { ChatMessage } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages ?? [];
    if (messages.length === 0) {
      return NextResponse.json(
        { error: "messages required" },
        { status: 400 }
      );
    }
    const reply = await getClaudeReply(mockOrder, messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
