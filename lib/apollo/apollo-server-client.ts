// lib/apollo/server.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";
import { auth } from "@clerk/nextjs/server";

export async function getServerApolloClient() {
  const { getToken } = await auth();
  let token: string | null = null;

  try {
    token = await getToken();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Server token fetch error:", err);
    }
  }

  const httpLink = createHttpLink({
    uri:
      ` ${process.env.NEXT_PUBLIC_APP_URL}/api/graphql` ||
      "http://localhost:3000/api/graphql",
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: APOLLO_CONFIG.cache,
    defaultOptions: APOLLO_DEFAULT_OPTIONS,
  });
}
