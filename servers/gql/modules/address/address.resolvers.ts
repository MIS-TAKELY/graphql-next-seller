export const addressResolvers = {
  Query: {
    getAddress: async () => {
      return "getAddress";
    },
  },
  Mutation: {
    updateAddress: async () => {
      return "updateAddress";
    },
  },
};
