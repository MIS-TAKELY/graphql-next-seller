// lib/apollo/ssr-provider.tsx (Most robust version)
"use client";

import { ApolloClient, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/nextjs";
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
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const authLink = setContext(async (_, { headers }) => {
      const token = await getToken();
      return {
        headers: { ...headers, authorization: token ? `Bearer ${token}` : "" },
      };
    });

    // console.log("auth link-->", authLink);

    const httpLink = createHttpLink({
      uri:
        `${process.env.NEXT_PUBLIC_APP_URL}/api/graphql` ||
        "/api/graphql",
    });

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });

    // console.log("inner cllient-->",client)

    // Hydrate cache with initial data


    return client;
  }, [
    getToken,
  ]);

  // console.log("outter cllient-->",client)

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
