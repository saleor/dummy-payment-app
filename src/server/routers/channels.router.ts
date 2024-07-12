import { router } from "../server";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";

export const channelsRouter = router({
  fetch: procedureWithGraphqlClient.query(async ({ ctx, input }) => {
    return {};
  }),
});
