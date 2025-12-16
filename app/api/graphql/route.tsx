import { createContext } from "@/servers/gql/context";
import { createYoga } from "graphql-yoga";
import type { NextRequest } from "next/server";
import { schema } from "../../../servers/gql/index";

const yoga = createYoga<{
  req: NextRequest;
}>({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Request, Response },
  context: async ({ request }: { request: NextRequest }) => {
    return await createContext(request);
  },
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
          "https://graphql-next-buyer-hmu9c58z1-mailitttome-4974s-projects.vercel.app", // frontend
          "https://graphql-next-buyer.vercel.app", // API itself (optional, in case of same-origin requests)
        ]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

export async function GET(request: NextRequest) {
  return yoga.handleRequest(request, { req: request });
}

export async function POST(request: NextRequest) {
  return yoga.handleRequest(request, { req: request });
}
