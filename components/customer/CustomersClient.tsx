"use client";

import { GET_CUSTOMERS } from "@/client/customer/customer.queries";
import { useQuery } from "@apollo/client";
import ClientCustomersPage from "./ClientCustomersPage";
import { CustomersSkeleton } from "./CustomersSkeleton";

export default function CustomersClient() {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMERS, {
    fetchPolicy: "cache-and-network",
    // pollInterval: 60000, // Poll every 60 seconds for new customers
  });

  if (loading && !data) {
    return <CustomersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading customers</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const customers = data?.getCustomers?.customers || [];
  const stats = data?.getCustomers?.stats;

  return <ClientCustomersPage customers={customers} stats={stats} onRefetch={refetch} />;
}

