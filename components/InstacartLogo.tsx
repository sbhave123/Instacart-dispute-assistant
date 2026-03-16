"use client";

import { cn } from "@/lib/utils";

/** Instacart-style wordmark + carrot icon for portfolio demo use. */
export function InstacartLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Carrot: orange body (wide top, point bottom) + green stem */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden
      >
        <path
          d="M7 5h10l3 14H4L7 5z"
          fill="#FF6B00"
        />
        <circle cx="12" cy="5" r="3" fill="#003D29" />
      </svg>
      {showWordmark && (
        <span
          className="text-xl font-bold tracking-tight text-[#003D29]"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          instacart
        </span>
      )}
    </div>
  );
}
