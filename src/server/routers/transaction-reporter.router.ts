import { z } from "zod";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";
import { router } from "../server";
import { TransactionEventTypeEnum } from "../../../generated/graphql";

export const transactionReporterRouter = router({
  reportEvent: procedureWithGraphqlClient
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        type: z.nativeEnum(TransactionEventTypeEnum),
      })
    )
    .mutation(async ({ ctx, input }) => {}),
});
