"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ChatBubble } from "@/components/ChatBubble";
import { ResolutionCard } from "@/components/ResolutionCard";
import { parseResolutionFromResponse, type Resolution } from "@/lib/claude";
import { formatOrderContext } from "@/lib/mockOrder";
import { mockOrder } from "@/lib/mockOrder";

const OPENING_MESSAGE =
  "I'm sorry to hear something went wrong. Can you tell me what happened with your order?";

/** Remove <resolution>...</resolution> so raw JSON is never shown in the chat. */
function stripResolutionBlock(text: string): string {
  return text.replace(/<resolution>[\s\S]*?<\/resolution>/g, "").trim();
}

function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text" && "text" in p)
    .map((p) => p.text)
    .join("");
}

export default function DisputePage() {
  const router = useRouter();
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/dispute",
      body: { orderContext: formatOrderContext(mockOrder) },
    }),
    messages: [
      {
        id: generateId(),
        role: "assistant",
        parts: [{ type: "text" as const, text: OPENING_MESSAGE }],
      },
    ],
    onFinish: ({ message }) => {
      const text = getMessageText(message);
      const parsed = parseResolutionFromResponse(text);
      if (parsed) setResolution(parsed);
    },
  });

  // After each AI response, check for <resolution> in the latest assistant message
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    const text = getMessageText(lastAssistant);
    const parsed = parseResolutionFromResponse(text);
    setResolution((prev) => (parsed ? parsed : prev));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, resolution]);

  const isLoading = status === "submitted" || status === "streaming";

  function handleSubmitDispute() {
    setIsSubmitting(true);
    const ref = `IC-D-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    router.push(`/dispute/confirmation?ref=${encodeURIComponent(ref)}`);
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5] max-w-[430px] mx-auto">
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-instacart-orange font-medium text-sm"
        >
          Back
        </button>
        <h1 className="font-semibold text-gray-900">Order help</h1>
        <div className="w-12" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const text = getMessageText(msg);
            // Hide raw <resolution> JSON from chat; only show the friendly summary
            const displayText = stripResolutionBlock(text) || text;
            if (!displayText.trim()) return null;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChatBubble
                  message={displayText}
                  isBot={msg.role === "assistant"}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-instacart-orange flex items-center justify-center text-white font-semibold text-sm">
              IA
            </div>
            <div className="rounded-2xl rounded-tl-md px-4 py-3 bg-white border border-gray-100 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
        {resolution && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-2"
          >
            <ResolutionCard
              resolution={resolution}
              onSubmit={handleSubmitDispute}
              isSubmitting={isSubmitting}
            />
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100">
        <DisputeInput
          onSend={(text) => sendMessage({ text })}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

function DisputeInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-[15px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="rounded-xl bg-[#FF6B00] text-white px-5 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#e55f00] transition"
      >
        Send
      </button>
    </form>
  );
}
