// lib/apollo/server.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import { schema } from "@/servers/gql";
import { createContext } from "@/servers/gql/context";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

export async function getServerApolloClient() {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")).replace(/\/$/, "");
  const uri = `${baseUrl}/api/graphql`;

  // Use SchemaLink for server-side to avoid network overhead and auth issues
  if (typeof window === "undefined") {
    return new ApolloClient({
      link: new SchemaLink({
        schema,
        context: async () => await createContext()
      }),
      cache: APOLLO_CONFIG.cache,
      defaultOptions: APOLLO_DEFAULT_OPTIONS,
    });
  }

  const httpLink = createHttpLink({
    uri,
  });

  return new ApolloClient({
    link: httpLink,
    cache: APOLLO_CONFIG.cache,
    defaultOptions: APOLLO_DEFAULT_OPTIONS,
  });
}
