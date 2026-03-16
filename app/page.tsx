"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { InstacartLogo } from "@/components/InstacartLogo";
import { mockOrder, DISPUTE_ORDER_STORAGE_KEY } from "@/lib/mockOrder";
import type { Order, LineItem } from "@/lib/mockOrder";

function saveOrderAndGoToDispute(order: Order) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(DISPUTE_ORDER_STORAGE_KEY, JSON.stringify(order));
  }
}

export default function HomePage() {
  const router = useRouter();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderId, setOrderId] = useState("");
  const [customItems, setCustomItems] = useState<LineItem[]>([
    { name: "", price: 0, quantity: 1 },
  ]);

  const customTotal = customItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const customOrderValid =
    storeName.trim() &&
    orderDate.trim() &&
    customItems.every((i) => i.name.trim() && i.price >= 0 && i.quantity >= 1);

  function addItem() {
    setCustomItems((prev) => [...prev, { name: "", price: 0, quantity: 1 }]);
  }

  function removeItem(index: number) {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setCustomItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function handleUseCustomOrder() {
    const order: Order = {
      orderId: orderId.trim() || `CUSTOM-${Date.now()}`,
      date: orderDate.trim(),
      storeName: storeName.trim(),
      items: customItems
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          price: Number(i.price) || 0,
          quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
        })),
      total: customTotal,
    };
    if (order.items.length === 0) return;
    saveOrderAndGoToDispute(order);
    router.push("/dispute");
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col">
      {/* Instacart header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-[430px] px-4 py-4">
          <InstacartLogo />
          <p className="text-xs font-medium text-[#003D29] mt-2 tracking-wide uppercase">
            Orders
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[430px] flex-1 flex flex-col px-4 py-6">
        {/* Intro */}
        <p className="text-sm text-gray-600 mb-4">
          View your order below. If something went wrong—missing items, wrong
          items, or delivery issues—tap <strong>Problem with this order?</strong> to
          start a short chat with our assistant and get a resolution. You can
          also try with your own order using the option below.
        </p>

        {/* Mock data label and sample order */}
        <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
          Sample order (mock data) — for demo only
        </p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ring-1 ring-black/5"
        >
          <div className="p-5 border-b border-gray-100 bg-[#003D29] text-white rounded-t-2xl">
            <p className="text-xs font-medium text-white/80">Order #{mockOrder.orderId}</p>
            <p className="font-semibold text-white">
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

          <div className="px-5 py-4 bg-[#003D29]/5 border-t border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-[#003D29]">Total paid</span>
            <span className="text-lg font-bold text-[#003D29]">
              ${mockOrder.total.toFixed(2)}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6"
        >
          <Link
            href="/dispute"
            onClick={() => saveOrderAndGoToDispute(mockOrder)}
            className="block w-full py-4 px-6 rounded-2xl text-center font-semibold text-white bg-[#FF6B00] hover:bg-[#e55f00] active:scale-[0.98] transition shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2"
          >
            Problem with this order?
          </Link>
        </motion.div>

        {/* Custom order section */}
        <div className="mt-8 pt-6 border-t border-[#003D29]/20">
          <button
            type="button"
            onClick={() => setShowCustomForm((v) => !v)}
            className="text-sm font-semibold text-[#FF6B00] hover:text-[#e55f00] hover:underline focus:outline-none"
          >
            {showCustomForm ? "Hide" : "Use your own order"}
          </button>

          {showCustomForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4"
            >
              <p className="text-xs text-gray-500">
                Enter your own grocery order to try different configurations.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Store name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Whole Foods"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    placeholder="e.g. March 12"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Order # (optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. IC-12345"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-700">Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs font-medium text-[#FF6B00] hover:underline"
                  >
                    + Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {customItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center flex-wrap"
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        placeholder="Item name"
                        className="flex-1 min-w-[100px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price || ""}
                        onChange={(e) =>
                          updateItem(index, "price", e.target.value)
                        }
                        placeholder="Price"
                        className="w-16 rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        placeholder="Qty"
                        className="w-12 rounded-lg border border-gray-200 px-2 py-2 text-sm focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: ${customTotal.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseCustomOrder}
                disabled={!customOrderValid}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#FF6B00] text-white hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2"
              >
                Get help with this order
              </button>
            </motion.div>
          )}
        </div>

        {/* Footer branding */}
        <footer className="mt-10 py-6 text-center">
          <p className="text-xs text-[#003D29]/70">
            Order support · Smart dispute assistant
          </p>
        </footer>
      </div>
    </div>
  );
}
