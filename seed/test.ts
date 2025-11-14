// // //makeing this ISR component because this component is mostly statcic and no to none client/user interaction , Data and graph gets changed after buyer actions(i.e buy,cart,etc..)

// import { AnalyticsContent } from "@/components/analytics/AnalyticsContent";
// import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";

// // Mock data - replace with actual data fetching
// const salesData = [
//   { name: "Jan", sales: 4000, revenue: 2400, orders: 240 },
//   { name: "Feb", sales: 3000, revenue: 1398, orders: 221 },
//   { name: "Mar", sales: 2000, revenue: 9800, orders: 229 },
//   { name: "Apr", sales: 2780, revenue: 3908, orders: 200 },
//   { name: "May", sales: 1890, revenue: 4800, orders: 218 },
//   { name: "Jun", sales: 2390, revenue: 3800, orders: 250 },
//   { name: "Jul", sales: 3490, revenue: 4300, orders: 210 },
// ];

// const productData = [
//   { name: "Wireless Headphones", value: 400, color: "#0088FE" },
//   { name: "Smart Watch", value: 300, color: "#00C49F" },
//   { name: "Laptop Stand", value: 300, color: "#FFBB28" },
//   { name: "USB-C Cable", value: 200, color: "#FF8042" },
//   { name: "Phone Case", value: 150, color: "#8884D8" },
// ];

// export default async function AnalyticsPage() {
//   const data = {
//     salesData,
//     productData,
//   };

//   return (
//     <div className="flex-1 space-y-4 p-2 sm:p-4 md:p-6 lg:p-8">
//       <AnalyticsHeader />
//       <AnalyticsContent initialData={data} />
//     </div>
//   );
// }