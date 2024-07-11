import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import {
  TransactionEventTypeEnum,
  TransactionFlowStrategyEnum,
  TransactionInitializeSessionDocument,
  TransactionInitializeSessionEventFragment,
} from "../../../../generated/graphql";
import { z } from "zod";
import { v7 as uuidv7 } from "uuid";
import { getTransactionActions } from "../../../lib/transaction-actions";
import { createLogger } from "../../logger";
import { getZodErrorMessage } from "../../../lib/zod-error";

export const transactionInitializeSessionWebhook =
  new SaleorSyncWebhook<TransactionInitializeSessionEventFragment>({
    name: "Transaction Initialize Session",
    webhookPath: "api/webhooks/transaction-initialize-session",
    event: "TRANSACTION_INITIALIZE_SESSION",
    apl: saleorApp.apl,
    query: TransactionInitializeSessionDocument,
  });

const transactionEventTypeSchema = z.enum([
  "CHARGE_REQUEST",
  "CHARGE_ACTION_REQUIRED",
  "CHARGE_FAILURE",
  "CHARGE_SUCCESS",
  "AUTHORIZATION_REQUEST",
  "AUTHORIZATION_ACTION_REQUIRED",
  "AUTHORIZATION_FAILURE",
  "AUTHORIZATION_SUCCESS",
]);

const dataSchema = z.object({
  event: z.object({
    type: transactionEventTypeSchema,
  }),
});

const responseSchema = z.object({
  pspReference: z.string(),
  result: transactionEventTypeSchema,
  amount: z.number(),
  data: z.record(z.union([z.string(), z.number()])).optional(),
  time: z.string().optional(),
  externalUrl: z.string().url().optional(),
  message: z.string().optional(),
  actions: z.array(z.union([z.literal("CHARGE"), z.literal("REFUND"), z.literal("CANCEL")])),
});

type ResponseType = z.infer<typeof responseSchema>;

export default transactionInitializeSessionWebhook.createHandler((req, res, ctx) => {
  const logger = createLogger("transaction-initialize-session");
  const { payload } = ctx;
  const { actionType, amount } = payload.action;

  logger.debug("Received webhook", { payload });

  const rawEventData = payload.data;
  const dataResult = dataSchema.safeParse(rawEventData);

  if (dataResult.error) {
    logger.warn("Invalid data field received in notification", { error: dataResult.error });

    const response: ResponseType = {
      pspReference: uuidv7(),
      result:
        actionType === TransactionFlowStrategyEnum.Charge
          ? "CHARGE_FAILURE"
          : "AUTHORIZATION_FAILURE",
      message: getZodErrorMessage(dataResult.error),
      amount,
      actions: [],
    };

    logger.info("Returning error response to Saleor", { response });

    return res.status(200).json(response);
  }

  const data = dataResult.data;

  logger.info("Parsed data field from notification", { data });

  const response: ResponseType = {
    pspReference: uuidv7(),
    result: data.event.type,
    message: "Success!",
    actions: getTransactionActions(data.event.type as TransactionEventTypeEnum),
    amount,
    // TODO: Link to the app's details page
    // externalUrl
  };

  logger.info("Returning response to Saleor", { response });

  return res.status(200).json(response);
});

/**
 * Disable body parser for this endpoint, so signature can be verified
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
