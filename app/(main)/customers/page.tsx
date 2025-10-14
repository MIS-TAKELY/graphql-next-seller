// app/customers/page.tsx (Server Component)
import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import ClientCustomersPage from "@/components/customer/ClientCustomersPage";
import { getServerApolloClient } from "@/lib/apollo/apollo-server-client";
import { ConversationsResponse } from "@/types/customer/customer.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function fetchConversationsServer(userId: string) {
  // console.log("user")
  return { conversations: [] };
}

export default async function CustomersPage() {
  const { userId } = await auth();
  console.log("user ID", userId);
  if (!userId) {
    redirect("/sign-up");
  }

  // Prerender static data like customers, reviews, disputes if fetchable server-side
  // For now, assuming they come from a server query or API; placeholder
  const staticData = {
    customers: [], // Fetch server-side
    reviews: [], // Fetch server-side
    disputes: [], // Fetch server-side
  };

  // Fetch conversations server-side for prerendering
  const { conversations: serverConversations } = await fetchConversationsServer(
    userId
  );

  const client = await getServerApolloClient();

  const getInitialConversatationsResponse = await client.query({
    query: GET_CONVERSATIONS,
    variables: {
      recieverId: userId,
    },
  });


  const initialConversatationData=getInitialConversatationsResponse.data

  console.log(
    "getInitialConversatationsResponse--->",
    getInitialConversatationsResponse,initialConversatationData
  );

  return (
    <ClientCustomersPage
      initialConversations={serverConversations}
      initialStaticData={staticData}
      recieverId={userId}
    />
  );
}
