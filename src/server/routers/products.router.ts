import { z } from "zod";
import { router } from "../server";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";

export const productsRouter = router({
  fetch: procedureWithGraphqlClient
    .input(
      z.object({
        count: z.number().min(1),
        channel: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return {};
    }),
});
