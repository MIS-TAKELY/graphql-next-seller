import { AnalyticsData } from "@/types/analytics/analytics";

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Simulated data fetching - replace with actual API/database calls
  const salesData = [
    { name: "Jan", sales: 4000, revenue: 2400, orders: 240 },
    { name: "Feb", sales: 3000, revenue: 1398, orders: 221 },
    { name: "Mar", sales: 2000, revenue: 9800, orders: 229 },
    { name: "Apr", sales: 2780, revenue: 3908, orders: 200 },
    { name: "May", sales: 1890, revenue: 4800, orders: 218 },
    { name: "Jun", sales: 2390, revenue: 3800, orders: 250 },
    { name: "Jul", sales: 3490, revenue: 4300, orders: 210 },
  ];

  const productData = [
    { name: "Wireless Headphones", value: 400, color: "#0088FE" },
    { name: "Smart Watch", value: 300, color: "#00C49F" },
    { name: "Laptop Stand", value: 300, color: "#FFBB28" },
    { name: "USB-C Cable", value: 200, color: "#FF8042" },
    { name: "Phone Case", value: 150, color: "#8884D8" },
  ];

  const metrics = {
    overview: [
      {
        title: "Total Revenue",
        value: "$45,231.89",
        trend: { value: "+20.1% from last month", isPositive: true },
      },
      // ... other metrics
    ],
    sales: [
      {
        title: "Daily Sales",
        value: "$1,234",
        description: "Today's sales",
      },
      // ... other metrics
    ],
    products: [
      {
        title: "Total Products",
        value: "1,234",
        description: "Active products",
      },
      // ... other metrics
    ],
    customers: [
      {
        title: "Total Customers",
        value: "2,350",
        description: "Registered customers",
      },
      // ... other metrics
    ],
  };

  return {
    salesData,
    productData,
    metrics,
  };
}

// Optional: Separate functions for different time periods
export async function getAnalyticsDataForPeriod(
  period: string
): Promise<AnalyticsData> {
  // Implement period-specific data fetching
  switch (period) {
    case "7days":
      // Fetch last 7 days data
      break;
    case "30days":
      // Fetch last 30 days data
      break;
    case "90days":
      // Fetch last 90 days data
      break;
    case "1year":
      // Fetch last year data
      break;
    default:
    // Default to 30 days
  }

  return getAnalyticsData();
}
