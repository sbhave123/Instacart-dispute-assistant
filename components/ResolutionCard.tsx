"use client";

import { cn } from "@/lib/utils";
import type { Resolution } from "@/lib/claude";
import {
  Package,
  Truck,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

const complaintIcons: Record<Resolution["complaint_type"], React.ReactNode> = {
  missing_items: <Package className="w-5 h-5" />,
  not_delivered: <Truck className="w-5 h-5" />,
  wrong_items: <RefreshCw className="w-5 h-5" />,
  damaged: <AlertTriangle className="w-5 h-5" />,
};

const complaintLabels: Record<Resolution["complaint_type"], string> = {
  missing_items: "Missing items",
  not_delivered: "Not delivered",
  wrong_items: "Wrong items",
  damaged: "Damaged",
};

const evidenceColors: Record<Resolution["evidence_quality"], string> = {
  strong: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-amber-100 text-amber-800 border-amber-200",
  weak: "bg-red-100 text-red-800 border-red-200",
};

const resolutionLabels: Record<Resolution["recommended_resolution"], string> = {
  full_refund: "Full refund",
  partial_refund: "Partial refund",
  redeliver: "Redeliver",
  credit: "Account credit",
};

interface ResolutionCardProps {
  resolution: Resolution;
  onSubmit: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ResolutionCard({
  resolution,
  onSubmit,
  isSubmitting = false,
  className,
}: ResolutionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-instacart-green">
            {complaintIcons[resolution.complaint_type]}
          </span>
          <span className="font-semibold text-gray-900">
            {complaintLabels[resolution.complaint_type]}
          </span>
        </div>

        {resolution.affected_items.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Affected items
            </p>
            <ul className="text-sm text-gray-700 space-y-0.5">
              {resolution.affected_items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Evidence quality
          </p>
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
              evidenceColors[resolution.evidence_quality]
            )}
          >
            {resolution.evidence_quality}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-instacart-green flex-shrink-0" />
          <p className="font-semibold text-gray-900">
            Recommended: {resolutionLabels[resolution.recommended_resolution]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-instacart-orange" />
          <p className="text-lg font-bold text-gray-900">
            Refund: ${resolution.refund_amount.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Confidence
          </p>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-instacart-green rounded-full transition-all duration-500"
              style={{ width: `${resolution.confidence}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{resolution.confidence}%</p>
        </div>

        {resolution.reasoning && (
          <p className="text-sm text-gray-600 italic">&ldquo;{resolution.reasoning}&rdquo;</p>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-[#FF6B00] text-white font-semibold text-base hover:bg-[#e55f00] active:scale-[0.98] transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting…" : "Submit Dispute"}
        </button>
      </div>
    </div>
  );
}
