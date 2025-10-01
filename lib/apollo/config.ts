// lib/apollo/config.ts
import { DefaultOptions, InMemoryCache } from "@apollo/client";

export const APOLLO_CONFIG = {
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: false,
      fetchPolicy: "cache-first",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
  },

  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
        },
      },
      Product: {
        fields: {
        },
      },
    },
  }),
};

export const APOLLO_DEFAULT_OPTIONS: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  },
  query: {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  },
  mutate: {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  },
};
