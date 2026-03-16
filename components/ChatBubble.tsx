"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  isBot: boolean;
  senderName?: string;
  avatar?: React.ReactNode;
  className?: string;
}

export function ChatBubble({
  message,
  isBot,
  senderName = "Insta-Assist",
  avatar,
  className,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 w-full max-w-[85%]",
        !isBot && "ml-auto flex-row-reverse",
        className
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-instacart-orange flex items-center justify-center text-white font-semibold text-sm">
          {avatar ?? "IA"}
        </div>
      )}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 shadow-sm",
          isBot
            ? "bg-white border border-gray-100 rounded-tl-md"
            : "bg-[#FF6B00] text-white rounded-tr-md"
        )}
      >
        {isBot && (
          <p className="text-xs font-medium text-instacart-green mb-1">
            {senderName}
          </p>
        )}
        <p className="text-[15px] leading-snug whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
}
