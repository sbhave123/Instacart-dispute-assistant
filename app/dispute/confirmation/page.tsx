"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? `IC-D-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 max-w-[430px] mx-auto">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-[#003D29] flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-gray-900 text-center mb-2"
      >
        Your dispute has been submitted
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-center mb-6"
      >
        You&apos;ll hear back within 2 hours
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 w-full text-center"
      >
        <p className="text-sm text-gray-500 mb-1">Reference number</p>
        <p className="font-mono font-semibold text-gray-900">{ref}</p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-gray-400 text-center mt-6"
      >
        Reviewed by AI + human team
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 w-full"
      >
        <Link
          href="/"
          className="block w-full py-4 px-6 rounded-2xl text-center font-semibold text-white bg-[#FF6B00] hover:bg-[#e55f00] transition"
        >
          Back to order
        </Link>
      </motion.div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center max-w-[430px] mx-auto">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
