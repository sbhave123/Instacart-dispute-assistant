"use client";

import { cn } from "@/lib/utils";
import type { Resolution } from "@/lib/claude";
import { getMockSignals } from "@/lib/mockSignals";
import {
  Package,
  Truck,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  Minus,
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
  const confidence = resolution.confidence;

  let confidenceLabel = "Manual review required";
  let confidenceColor = "bg-red-500";
  let confidenceExplanation =
    "This case will be sent to a specialist for full manual review before any action is taken.";

  if (confidence >= 75) {
    confidenceLabel = "Auto-resolved";
    confidenceColor = "bg-green-600";
    confidenceExplanation =
      "This case can be auto-resolved based on your report and backend signals.";
  } else if (confidence >= 60) {
    confidenceLabel = "Auto-resolved with monitoring";
    confidenceColor = "bg-yellow-500";
    confidenceExplanation =
      "This case will be auto-resolved, but we’ll keep an eye on related activity for anomalies.";
  } else if (confidence >= 40) {
    confidenceLabel = "Routed to human agent";
    confidenceColor = "bg-orange-500";
    confidenceExplanation =
      "A human agent will review this case shortly, using your report and backend signals.";
  }

  const signals = getMockSignals(resolution.complaint_type);

  const signalItems = [
    {
      key: "gps",
      label: "GPS trace",
      status: signals.gps.status,
      detail: signals.gps.detail,
    },
    {
      key: "photo",
      label: "Delivery photo metadata",
      status: signals.photo.status,
      detail: signals.photo.detail,
    },
    {
      key: "scanRecords",
      label: "Item scan records",
      status: signals.scanRecords.status,
      detail: signals.scanRecords.detail,
    },
    {
      key: "accountHistory",
      label: "Account history",
      status:
        signals.accountHistory.orderCount === 0
          ? ("unavailable" as const)
          : ("match" as const),
      detail: `${signals.accountHistory.disputeCount} disputes in ${signals.accountHistory.orderCount} orders (${Math.round(
        signals.accountHistory.ratio * 100
      )}% ratio)`,
    },
    {
      key: "shopperAnomaly",
      label: "Shopper anomaly",
      status: signals.shopperAnomaly.detected ? ("anomaly" as const) : ("match" as const),
      detail: signals.shopperAnomaly.detail,
    },
  ];

  const getSignalIconAndColor = (status: string) => {
    if (status === "match" || status === "consistent" || status === "complete") {
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        className: "text-green-600",
      };
    }
    if (status === "anomaly" || status === "mismatch" || status === "missing_items") {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        className: "text-amber-500",
      };
    }
    return {
      icon: <Minus className="w-4 h-4" />,
      className: "text-gray-400",
    };
  };

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
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Confidence
          </p>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-800">
              {confidenceLabel}
            </p>
            <p className="text-xs text-gray-500">{confidence}%</p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                confidenceColor
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{confidenceExplanation}</p>
        </div>

        {resolution.reasoning && (
          <p className="text-sm text-gray-600 italic">&ldquo;{resolution.reasoning}&rdquo;</p>
        )}

        <div className="pt-3 border-t border-gray-100 mt-2">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Backend signals checked
            </p>
            <p className="text-[11px] text-gray-400">
              These signals are not visible to the customer.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {signalItems.map((s) => {
              const { icon, className: iconClass } = getSignalIconAndColor(s.status);
              return (
                <div key={s.key} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex items-center justify-center rounded-full",
                      iconClass
                    )}
                  >
                    {icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{s.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
