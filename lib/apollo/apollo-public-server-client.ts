// lib/apollo/apollo-public-server-client.ts (new file)
import { ApolloClient, createHttpLink } from "@apollo/client";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

export async function getPublicServerApolloClient() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const httpLink = createHttpLink({
    uri: `${baseUrl.replace(/\/$/, "")}/api/graphql`,
  });

  return new ApolloClient({
    link: httpLink,
    cache: APOLLO_CONFIG.cache,
    defaultOptions: APOLLO_DEFAULT_OPTIONS,
  });
}