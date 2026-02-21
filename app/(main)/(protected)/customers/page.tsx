import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { GET_CUSTOMERS } from "@/client/customer/customer.queries";
import ClientCustomersPage from "@/components/customer/ClientCustomersPage";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const client = await getServerApolloClient();
  const { data } = await client.query({
    query: GET_CUSTOMERS,
    fetchPolicy: "no-cache"
  });

  const customers = JSON.parse(JSON.stringify(data?.getCustomers?.customers || []));
  const rawStats = data?.getCustomers?.stats;
  const stats = rawStats ? JSON.parse(JSON.stringify(rawStats)) : undefined;

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 lg:p-8 pt-4 sm:pt-6 transition-all duration-300 ease-in-out">
      <ClientCustomersPage customers={customers} stats={stats} />
    </div>
  );
}
