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
import { TRPCError } from "@trpc/server";
import { createLogger } from "@/lib/logger/logger";
import { AppUrlGenerator } from "@/modules/url/app-url-generator";

export const transactionReporterRouter = router({
  reportEvent: procedureWithGraphqlClient
    .input(
      z.object({
        id: z.string(),
        amount: z.number(),
        type: z.nativeEnum(TransactionEventTypeEnum),
        pspReference: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, amount, type, pspReference, message } = input;
      const logger = createLogger("transactionReporterRouter.reportEvent", { input });

      const urlGenerator = new AppUrlGenerator(ctx.authData);

      const result = await ctx.apiClient.mutation(TransactionEventReportDocument, {
        id,
        amount,
        type,
        pspReference: pspReference ?? uuidv7(),
        message: message ?? "Great success!",
        availableActions: getTransactionActions(type) as TransactionActionEnum[],
        externalUrl: urlGenerator.getTransactionDetailsUrl(id, { includeSaleorBaseUrl: true }),
      });

      logger.info("Received result from Saleor", { result });

      if (result.error) {
        logger.error("There was an error while making mutation call", { error: result.error });
        throw new TRPCError({
          message: "There was an error while making transactionEventReport mutation",
          cause: result.error,
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const errors = result.data?.transactionEventReport?.errors;
      if (errors && errors.length > 0) {
        logger.error("Error in mutation result", { errors });
        throw new TRPCError({
          message: "There was an error while making transactionEventReport mutation",
          cause: errors[0],
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      const data = result.data?.transactionEventReport;

      if (!data) {
        logger.error("Missing data in response", { data: result.data });
        throw new TRPCError({
          message: "Saleor didn't return response from transactionEventReport mutation",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      return {
        alreadyProcessed: data.alreadyProcessed,
        transactionEvent: data.transactionEvent,
      };
    }),
});
