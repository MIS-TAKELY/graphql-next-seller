// lib/apollo/client.ts
import { ApolloClient, createHttpLink } from "@apollo/client";
import { useMemo } from "react";
import { APOLLO_CONFIG, APOLLO_DEFAULT_OPTIONS } from "./config";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
const httpLink = createHttpLink({
    uri: baseUrl ? `${baseUrl.replace(/\/$/, "")}/api/graphql` : "/api/graphql",
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
