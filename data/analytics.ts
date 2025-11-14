// data/analytics.ts
export const salesData = [
  { name: "Jan", sales: 4000, revenue: 2400, orders: 240 },
  { name: "Feb", sales: 3000, revenue: 1398, orders: 221 },
  { name: "Mar", sales: 2000, revenue: 9800, orders: 229 },
  { name: "Apr", sales: 2780, revenue: 3908, orders: 200 },
  { name: "May", sales: 1890, revenue: 4800, orders: 218 },
  { name: "Jun", sales: 2390, revenue: 3800, orders: 250 },
  { name: "Jul", sales: 3490, revenue: 4300, orders: 210 },
];

export const productData = [
  { name: "Wireless Headphones", value: 400, color: "#0088FE" },
  { name: "Smart Watch", value: 300, color: "#00C49F" },
  { name: "Laptop Stand", value: 300, color: "#FFBB28" },
  { name: "USB-C Cable", value: 200, color: "#FF8042" },
  { name: "Phone Case", value: 150, color: "#8884D8" },
];

export const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-3))",
  },
};
