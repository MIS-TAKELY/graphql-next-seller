// lib/apollo/client.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/graphql` || "http://localhost:3000/api/graphql",
});

export function useApolloClientWrapper() {
  const { getToken } = useAuth();

  return useMemo(() => {
    const authLink = setContext(async (_, { headers }) => {
      const token = await getToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });
  }, [getToken]);
}
