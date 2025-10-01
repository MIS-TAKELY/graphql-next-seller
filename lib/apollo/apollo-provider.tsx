// lib/apollo/provider.tsx
"use client";

import { ApolloProvider } from "@apollo/client";
import { useApolloClientWrapper } from "./apollo-client";

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useApolloClientWrapper();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
