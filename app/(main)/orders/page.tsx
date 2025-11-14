import OrdersClient from "@/components/orders/OrdersClient";

export default async function OrdersPage() {
  return (
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 transition-all duration-300 ease-in-out">
      <OrdersClient />
    </div>
  );
}