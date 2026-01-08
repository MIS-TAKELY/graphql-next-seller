// lib/apollo/client.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
};

const httpLink = createHttpLink({
  uri: `${getBaseUrl()}/api/graphql`,
});

export function useApolloClientWrapper() {
  return useMemo(() => {
    return new ApolloClient({
      link: httpLink,
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });
  }, []);
}
