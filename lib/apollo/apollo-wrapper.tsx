// lib/apollo/ssr-provider.tsx (Most robust version)
"use client";

import { ApolloClient, ApolloProvider, createHttpLink } from "@apollo/client";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

interface SSRApolloProviderProps {
  children: React.ReactNode;
  initialData?: {
    addresses?: any[];
    userProfile?: any;
    products?: any[];
    currentProduct?: any;
  };
}

export function SSRApolloProvider({
  children,
  initialData,
}: SSRApolloProviderProps) {
  const client = useMemo(() => {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).replace(/\/$/, "");

    const httpLink = createHttpLink({
      uri: typeof window !== "undefined"
        ? "/api/graphql"
        : baseUrl ? `${baseUrl}/api/graphql` : "http://localhost:3000/api/graphql",
    });

    const client = new ApolloClient({
      link: httpLink,
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });

    return client;
  }, [
    initialData?.addresses,
    initialData?.userProfile,
    initialData?.products,
    initialData?.currentProduct,
  ]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
