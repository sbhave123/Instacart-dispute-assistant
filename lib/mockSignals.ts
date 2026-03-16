export type SignalStatus =
  | "match"
  | "anomaly"
  | "unavailable"
  | "consistent"
  | "mismatch"
  | "complete"
  | "missing_items";

export interface VerificationSignals {
  gps: {
    status: "match" | "anomaly" | "unavailable";
    detail: string;
  };
  photo: {
    status: "consistent" | "mismatch" | "unavailable";
    detail: string;
  };
  scanRecords: {
    status: "complete" | "missing_items" | "unavailable";
    detail: string;
  };
  accountHistory: {
    disputeCount: number;
    orderCount: number;
    ratio: number;
  };
  shopperAnomaly: {
    detected: boolean;
    detail: string;
  };
}

export function getMockSignals(complaintType: string): VerificationSignals {
  switch (complaintType) {
    case "missing_items":
      return {
        gps: {
          status: "match",
          detail:
            "Shopper GPS and dropoff location match the customer address within 10 meters.",
        },
        photo: {
          status: "consistent",
          detail:
            "Delivery photo shows bags at the correct doorstep; no obvious tampering.",
        },
        scanRecords: {
          status: "missing_items",
          detail:
            "2 items (including Organic Bananas) were not scanned as packed at the store.",
        },
        accountHistory: {
          disputeCount: 2,
          orderCount: 47,
          ratio: 2 / 47,
        },
        shopperAnomaly: {
          detected: false,
          detail: "No prior anomalies on this shopper in the last 90 days.",
        },
      };

    case "not_delivered":
      return {
        gps: {
          status: "anomaly",
          detail:
            "Final GPS ping is 3 blocks away from the customer address on a different street.",
        },
        photo: {
          status: "mismatch",
          detail:
            "Delivery photo geotag does not match the customer address; background does not match building profile.",
        },
        scanRecords: {
          status: "complete",
          detail:
            "All items were scanned as picked and packed; no store-side anomalies detected.",
        },
        accountHistory: {
          disputeCount: 1,
          orderCount: 32,
          ratio: 1 / 32,
        },
        shopperAnomaly: {
          detected: true,
          detail:
            "Shopper has 3 recent orders flagged for potential mis-delivery in the last 14 days.",
        },
      };

    case "wrong_items":
      return {
        gps: {
          status: "match",
          detail:
            "Delivery location matches the customer address; no route anomalies detected.",
        },
        photo: {
          status: "consistent",
          detail:
            "Delivery photo shows grocery bags consistent with an on-time delivery.",
        },
        scanRecords: {
          status: "complete",
          detail:
            "Substitution log shows shopper-selected replacements for 2 items, including bananas.",
        },
        accountHistory: {
          disputeCount: 3,
          orderCount: 85,
          ratio: 3 / 85,
        },
        shopperAnomaly: {
          detected: false,
          detail:
            "Substitution rate for this shopper is within normal range for the store.",
        },
      };

    case "damaged":
      return {
        gps: {
          status: "match",
          detail:
            "Delivery completed at the correct address; no timing or route anomalies.",
        },
        photo: {
          status: "consistent",
          detail:
            "Delivery photo shows intact bags; no visible damage at dropoff.",
        },
        scanRecords: {
          status: "complete",
          detail:
            "All items scanned correctly; no indication of missing or substituted items.",
        },
        accountHistory: {
          disputeCount: 0,
          orderCount: 24,
          ratio: 0,
        },
        shopperAnomaly: {
          detected: false,
          detail:
            "No anomaly flags on this shopper; damage likely occurred in transit or post-dropoff.",
        },
      };

    default:
      return {
        gps: {
          status: "unavailable",
          detail: "No GPS data available for this order.",
        },
        photo: {
          status: "unavailable",
          detail: "No delivery photo or geotag data available.",
        },
        scanRecords: {
          status: "unavailable",
          detail: "No scan records available; store did not provide item-level scans.",
        },
        accountHistory: {
          disputeCount: 0,
          orderCount: 0,
          ratio: 0,
        },
        shopperAnomaly: {
          detected: false,
          detail: "No anomaly signals available for this shopper on this order.",
        },
      };
  }
}

