export interface LineItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  date: string;
  storeName: string;
  items: LineItem[];
  total: number;
}

export const mockOrder: Order = {
  orderId: "IC-88472-291",
  date: "March 12",
  storeName: "Whole Foods",
  items: [
    { name: "Organic Bananas", price: 2.49, quantity: 1 },
    { name: "Whole Milk, 1 gal", price: 4.29, quantity: 1 },
    { name: "Sourdough Bread", price: 5.99, quantity: 1 },
    { name: "Organic Chicken Breast", price: 12.97, quantity: 1 },
    { name: "Greek Yogurt, 32 oz", price: 6.49, quantity: 1 },
    { name: "Avocados", price: 4.99, quantity: 2 },
  ],
  total: 67.42,
};

export function formatOrderContext(order: Order): string {
  const lines = order.items.map(
    (i) => `- ${i.name}: $${i.price.toFixed(2)} x ${i.quantity}`
  );
  return [
    `Order #${order.orderId}`,
    `Store: ${order.storeName}`,
    `Date: ${order.date}`,
    "Items:",
    ...lines,
    `Total paid: $${order.total.toFixed(2)}`,
  ].join("\n");
}
