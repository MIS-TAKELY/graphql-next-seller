import { prisma } from "@/lib/db/prisma";
import { GraphQLContext } from "../../context";

export const addressResolvers = {
  Query: {
    getAddress:async()=>{
        return "getAddress"
    }
  },
  Mutation: {
   updateAddress:async()=>{
        return "updateAddress"
    }
  },
};