// lib/apollo/config.ts
import { DefaultOptions, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

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
          // Optimize pagination with relay style
          getMyProducts: relayStylePagination(),
          getSellerOrders: relayStylePagination(),
          getCustomers: {
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              if (!args?.skip) {
                // Initial load - replace
                return incoming;
              }
              // Append for pagination, preserve stats and totalCount
              return {
                ...incoming,
                customers: [...(existing?.customers ?? []), ...incoming.customers],
                stats: incoming.stats ?? existing?.stats,
                totalCount: incoming.totalCount ?? existing?.totalCount,
              };
            },
          },
        },
      },
      Product: {
        keyFields: ['id'],
        fields: {
          // Cache variants computation
          variants: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      SellerOrder: {
        keyFields: ['id'],
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
