"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { mockOrder } from "@/lib/mockOrder";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="mx-auto w-full max-w-[430px] flex-1 flex flex-col px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <p className="text-sm text-gray-500">Order #{mockOrder.orderId}</p>
            <p className="font-semibold text-gray-900">
              {mockOrder.storeName}, {mockOrder.date}
            </p>
          </div>

          <ul className="divide-y divide-gray-100">
            {mockOrder.items.map((item) => (
              <li
                key={item.name}
                className="flex justify-between items-center py-4 px-5 text-sm"
              >
                <span className="text-gray-800">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="text-gray-500"> × {item.quantity}</span>
                  )}
                </span>
                <span className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total paid</span>
            <span className="text-lg font-bold text-gray-900">
              ${mockOrder.total.toFixed(2)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-8"
        >
          <Link
            href="/dispute"
            className="block w-full py-4 px-6 rounded-2xl text-center font-semibold text-white bg-[#FF6B00] hover:bg-[#e55f00] active:scale-[0.98] transition shadow-md"
          >
            Problem with this order?
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
