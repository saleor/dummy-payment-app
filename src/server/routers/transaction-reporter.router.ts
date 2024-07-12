import { z } from "zod";
import { procedureWithGraphqlClient } from "../procedure/procedure-with-graphql-client";
import { router } from "../server";
import {
  TransactionActionEnum,
  TransactionEventReportDocument,
  TransactionEventTypeEnum,
} from "../../../generated/graphql";
import { v7 as uuidv7 } from "uuid";
import { getTransactionActions } from "@/lib/transaction-actions";

export const transactionReporterRouter = router({
  reportEvent: procedureWithGraphqlClient
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        type: z.nativeEnum(TransactionEventTypeEnum),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, amount, type, message } = input;

      ctx.apiClient.mutation(TransactionEventReportDocument, {
        id,
        amount,
        type,
        pspReference: uuidv7(),
        message: message ?? "Great success!",
        availableActions: getTransactionActions(type) as TransactionActionEnum[],
        // TODO: Add externalUrl
        // externalUrl: ""
      });
    }),
});
