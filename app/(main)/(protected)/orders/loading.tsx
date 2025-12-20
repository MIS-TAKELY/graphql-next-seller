import { OrdersSkeleton } from "@/components/orders/OrdersSkeleton";

export default function Loading() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6">
      <OrdersSkeleton />
    </div>
  );
}
